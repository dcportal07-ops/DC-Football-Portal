"use server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { clerkClient } from "@clerk/nextjs/server";
import { getDrillById, MASTER_DRILLS } from "@/lib/drills"; 
import { sendNotification } from "./automation";

async function ensureAdmin() {
  const user = await currentUser();
  if (!user || user.publicMetadata.role !== "admin") {
    throw new Error("Unauthorized: Admin only");
  }
}



type ResponseState = { success: boolean; error: boolean; message?: string };


export const getAllTeams = async () => {
  try {
    return await prisma.team.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
  } catch (err) {
    return [];
  }
};

export const getAllCoaches = async () => {
  try {
    const coaches = await prisma.coachProfile.findMany({
      include: { user: true }, 
      orderBy: { user: { name: 'asc' } }
    });
    
    return coaches.map(c => ({ 
        id: c.id, 
        name: c.user.name 
    }));
  } catch (err) {
    console.log(err);
    return [];
  }
};

export type FlipCardData = {
  overallScore: number;
  coachName: string;
  stats: { name: string; value: number; fill: string }[]; 
  weaknesses: { name: string; score: number }[];
  homework: { title: string; desc: string }[]; // ✅ Homework Data
};


// 1. Get all players for the dropdown
export const getAllPlayers = async () => {
  return await prisma.playerProfile.findMany({
    select: { 
      id: true, 
      user: { select: { name: true } },
      team: { select: { name: true } }
    },
    orderBy: { user: { name: 'asc' } }
  });
};

// 2. Get available evaluation dates for a specific player
export const getPlayerDates = async (playerId: string) => {
  const evaluations = await prisma.evaluation.findMany({
    where: { playerId },
    // 👇 Change 'date' to 'createdAt'
    select: { createdAt: true, id: true }, 
    orderBy: { createdAt: 'desc' }
  });
  
  return evaluations.map(e => ({
    id: e.id,
    // 👇 Map createdAt to the UI's expected 'date' format
    date: e.createdAt.toISOString().split('T')[0] 
  }));
};

// 3. Get Comparison Data
const calculateScore = (evalRecord: any, category: string) => {
  if (!evalRecord) return 0;

  // A. Try reading the direct database column first (Fastest)
  // We use >= 0 check carefully, but usually we want > 0 to avoid empty data
  if (evalRecord[category] !== undefined && evalRecord[category] !== null && evalRecord[category] > 0) {
    return evalRecord[category];
  }

  // B. Fallback: Dig into ratingsJson
  try {
    const json = evalRecord.ratingsJson as any;
    if (!json) return 0;

    const target = json[category];

    // Case 1: It's a single number (e.g., attacking: 72)
    if (typeof target === 'number') {
        return target;
    }
    
    // Case 2: It's a string that looks like a number
    if (typeof target === 'string' && !isNaN(Number(target))) {
        return Number(target);
    }

    // Case 3: It's an object of sub-skills (e.g., technical: { dribbling: 8, passing: 6 })
    if (typeof target === 'object' && target !== null) {
      const values = Object.values(target).map((v) => Number(v));
      if (values.length > 0) {
        const sum = values.reduce((a, b) => a + b, 0);
        return Math.round(sum / values.length);
      }
    }
  } catch (e) {
    console.error(`Error calculating score for ${category}`, e);
  }

  return 0;
};

export const createFlipCard = async (
  playerId: string,
  coachId: string,
  data: FlipCardData
) => {
  try {
    const getVal = (name: string) => data.stats.find(s => s.name === name)?.value || 0;
    
    const tech = getVal("Technical");
    const tact = getVal("Tactical");
    const phys = getVal("Physical");
    const ment = getVal("Mental");
    // 🔥 Capture these explicitly
    const att = getVal("Attacking");
    const def = getVal("Defending");

    // Create FlipCard
    await prisma.flipCard.create({
      data: {
        title: `Performance Card - ${new Date().toLocaleDateString()}`,
        content: data as any,
        playerId: playerId,
        coachId: coachId,
      },
    });
    await prisma.evaluation.create({
        data: {
            playerId: playerId,
            coachId: coachId,
            technical: tech,
            tactical: tact,
            physical: phys,
            mental: ment,
            attacking: att, 
            defending: def,

            ratingsJson: {
                technical: { "Score": tech },
                tactical: { "Score": tact },
                physical: { "Score": phys },
                mental: { "Score": ment },
                attacking: att,
                defending: def
            },
            note: "Auto-generated from Performance FlipCard.",
        }
    });

    revalidatePath(`/list/players/${playerId}`);
    revalidatePath(`/list/evaluations`);
    
    return { success: true, message: "Card & Evaluation Created!" };
  } catch (err) {
    console.log("Error creating card:", err);
    return { success: false, message: "Failed to create card" };
  }
};

export const getComparisonData = async (playerId: string, dateA: string, dateB: string) => {
  const evals = await prisma.evaluation.findMany({
    where: {
      playerId,
      OR: [
        { createdAt: { gte: new Date(`${dateA}T00:00:00.000Z`), lte: new Date(`${dateA}T23:59:59.999Z`) } },
        { createdAt: { gte: new Date(`${dateB}T00:00:00.000Z`), lte: new Date(`${dateB}T23:59:59.999Z`) } }
      ]
    }
  });

  const findEval = (d: string) => evals.find(e => e.createdAt.toISOString().split('T')[0] === d);
  const evalA = findEval(dateA);
  const evalB = findEval(dateB);

  // 🔥 Added Attacking and Defending to the radar
  const categories = ['technical', 'tactical', 'physical', 'mental', 'attacking', 'defending'];
  
  const chartData = categories.map(cat => ({
      subject: cat.charAt(0).toUpperCase() + cat.slice(1),
      A: calculateScore(evalA, cat), // Uses the fixed helper
      B: calculateScore(evalB, cat),
      fullMark: 100
  }));

  const deltas = categories.map(cat => {
    const valA = calculateScore(evalA, cat);
    const valB = calculateScore(evalB, cat);
    const diff = valB - valA;
    const percent = valA === 0 ? 0 : ((diff / valA) * 100);

    return {
      name: cat.charAt(0).toUpperCase() + cat.slice(1),
      absolute: diff > 0 ? `+${diff}` : `${diff}`,
      percentage: diff > 0 ? `+${percent.toFixed(1)}%` : `${percent.toFixed(1)}%`,
      isPositive: diff >= 0
    };
  });

  return { chartData, deltas };
};


interface EvaluationFormData {
  playerId: string;
  coachId: string;
  subScores: Record<string, Record<string, number>>; // Nested Object { technical: { Ball Control: 4 } }
  note?: string;
}

export const createFullEvaluation = async (data: EvaluationFormData) => {
  
  // 1. Calculate Averages for the Radar Chart
  // We take the detailed sub-scores and average them to get the Top Level stats (Technical, Tactical, etc.)
  const categories = ["technical", "tactical", "physical", "mental"];
  const averages: Record<string, number> = {};

  categories.forEach(cat => {
    const skills = data.subScores[cat];
    if (skills) {
      const values = Object.values(skills);
      const sum = values.reduce((a, b) => a + b, 0);
      // Round to nearest integer for the database Int field
      averages[cat] = values.length > 0 ? Math.round(sum / values.length) : 0;
    } else {
      averages[cat] = 0;
    }
  });

  // 2. Save to Database
  try {
    await prisma.evaluation.create({
      data: {
        playerId: data.playerId,
        coachId: data.coachId,
        
        // --- Stats for Radar Chart ---
        technical: averages.technical || 0,
        tactical: averages.tactical || 0,
        physical: averages.physical || 0,
        mental: averages.mental || 0,
        
        // Auto-calculating Attacking/Defending based on Technical/Tactical for now 
        // (You can add specific sliders for these if you want)
        attacking: averages.technical || 0, 
        defending: averages.tactical || 0,

        // --- Full Detailed Data ---
        ratingsJson: data.subScores, 
        note: data.note
      }
    });
    
    revalidatePath(`/list/players/${data.playerId}`);
    return { success: true };
  } catch (error) {
    console.error("Save Error:", error);
    return { success: false, error: "Failed to save evaluation" };
  }
};



// ==========================================
// 1. COACH ACTIONS
// ==========================================

export const createCoach = async (data: any): Promise<ResponseState> => {
  try {
    // ... (password logic remains same)
    const passwordToUse = (data.password && data.password.length >= 8) 
      ? data.password 
      : "Coach@123!"; 

    const client = await clerkClient();
    const clerkUser = await client.users.createUser({
      username: data.username,
      password: passwordToUse,
      firstName: data.name.split(" ")[0],
      lastName: data.name.split(" ").slice(1).join(" "),
      emailAddress: [data.email],
      publicMetadata: { role: "coach" },
    });

    await prisma.$transaction(async (tx) => {
        // ... (User creation logic remains same)
        await tx.user.create({
            data: {
                id: clerkUser.id,
                userCode: data.username,
                name: data.name,
                email: data.email,
                phone: data.phone,
                role: "COACH",
                photo: typeof data.img === "string" ? data.img : null,
            },
        });

        const profile = await tx.coachProfile.create({
            data: { userId: clerkUser.id },
        });

        // ... (Team linking logic remains same)
        if (data.teams && data.teams.length > 0) {
            const validTeams = data.teams.filter((tId: string) => tId && tId.trim() !== "");
            if (validTeams.length > 0) {
                await tx.coachTeam.createMany({
                    data: validTeams.map((tId: string) => ({
                        coachId: profile.id,
                        teamId: tId 
                    }))
                });
            }
        }
        
        // 4. 🔥 FIXED: Explicitly typed 's' as string
        if (data.specialties && typeof data.specialties === 'string') {
            const specs = data.specialties
                .split(',')
                .map((s: string) => s.trim()) // <--- Added type here
                .filter((s: string) => s !== ""); // <--- And here just to be safe
            
            for (const specName of specs) {
                const specialty = await tx.specialty.upsert({
                    where: { name: specName },
                    update: {},
                    create: { name: specName }
                });

                await tx.coachSpecialty.create({
                    data: {
                        coachId: profile.id,
                        specialtyId: specialty.id
                    }
                });
            }
        }
    });

    revalidatePath("/list/coaches");
    return { success: true, error: false, message: `Coach Created! Pass: ${passwordToUse}` };

  } catch (err: any) {
    console.error("Create Error:", err);
    if (err.errors && err.errors.length > 0) {
      return { success: false, error: true, message: err.errors[0].longMessage };
    }
    return { success: false, error: true, message: "Failed to create coach." };
  }
};

export const updateCoach = async (data: any): Promise<ResponseState> => {
  if (!data.id) return { success: false, error: true, message: "ID missing" };

  try {
    // ... (User lookup logic remains same)
    const existingProfile = await prisma.coachProfile.findUnique({
      where: { id: data.id },
      select: { userId: true }
    });

    if (!existingProfile) return { success: false, error: true, message: "Coach not found" };

    const userId = existingProfile.userId;
    const client = await clerkClient();

    try {
        await client.users.updateUser(userId, {
            firstName: data.name.split(" ")[0],
            lastName: data.name.split(" ").slice(1).join(" "),
        });
    } catch(e) { console.log("Clerk update skipped", e); }

    await prisma.$transaction(async (tx) => {
        // ... (Update User & Team logic remains same)
        await tx.user.update({
            where: { id: userId },
            data: {
                name: data.name,
                email: data.email,
                phone: data.phone,
                userCode: data.username,
                photo: typeof data.img === "string" ? data.img : undefined,
            },
        });

        await tx.coachTeam.deleteMany({ where: { coachId: data.id } });
            
        if (data.teams && data.teams.length > 0) {
            const validTeams = data.teams.filter((t: string) => t !== "");
            if (validTeams.length > 0) {
                await tx.coachTeam.createMany({
                    data: validTeams.map((tId: string) => ({
                        coachId: data.id,
                        teamId: tId
                    }))
                });
            }
        }

        // 3. 🔥 FIXED: Explicitly typed 's' as string here too
        await tx.coachSpecialty.deleteMany({ where: { coachId: data.id } });

        if (data.specialties && typeof data.specialties === 'string') {
            const specs = data.specialties
                .split(',')
                .map((s: string) => s.trim()) // <--- Added type here
                .filter((s: string) => s !== ""); 
            
            for (const specName of specs) {
                const specialty = await tx.specialty.upsert({
                    where: { name: specName },
                    update: {},
                    create: { name: specName }
                });

                await tx.coachSpecialty.create({
                    data: {
                        coachId: data.id,
                        specialtyId: specialty.id
                    }
                });
            }
        }
    });

    revalidatePath("/list/coaches");
    return { success: true, error: false, message: "Coach updated successfully!" };
  } catch (err) {
    console.error(err);
    return { success: false, error: true, message: "Update failed" };
  }
};

export const deleteCoach = async (id: string): Promise<ResponseState> => {
  try {
    // 1. Find the Coach Profile & User ID
    const profile = await prisma.coachProfile.findUnique({
        where: { id: id },
        select: { userId: true, id: true } // get profile ID too
    });

    if (!profile) {
        return { success: false, error: true, message: "Coach not found." };
    }

    // 2. DELETE CLERK USER
    const client = await clerkClient();
    try { 
        await client.users.deleteUser(profile.userId); 
    } catch (e) {
        console.log("Clerk User not found or already deleted");
    } 

    // 3. CLEAN UP DATABASE RELATIONS MANUALLY (Safety Step)
    await prisma.$transaction(async (tx) => {
        // Remove from Teams
        await tx.coachTeam.deleteMany({ where: { coachId: profile.id } });
        
        // Remove Specialties
        await tx.coachSpecialty.deleteMany({ where: { coachId: profile.id } });

        // Remove Assignments (Optional: Or keep them but set coachId to null)
        await tx.assignment.deleteMany({ where: { coachId: profile.id } });

        // Remove Evaluations
        await tx.evaluation.deleteMany({ where: { coachId: profile.id } });

        // Finally, Delete the USER (Cascade should handle Profile)
        await tx.user.delete({ where: { id: profile.userId } });
    });

    revalidatePath("/list/coaches");
    return { success: true, error: false, message: "Coach Deleted Successfully." };
  } catch (err) {
    console.error("Delete Error:", err);
    return { success: false, error: true, message: "Delete Failed. Check database constraints." };
  }
};


// ==========================================
// 2. PLAYER ACTIONS
// ==========================================

export const createPlayer = async (data: any): Promise<ResponseState> => {
  try {
    const passwordToUse = (data.password && data.password.length >= 8) 
      ? data.password 
      : "Player@123!"; 

    // --- NEW VALIDATION ---
    // If a coach is creating a player, they MUST assign a team, otherwise they can't see them.
    // Ensure your form sends 'teamId' correctly.
    if (!data.teamId) {
        // Optional: You could fetch the coach's first team here and auto-assign
        // But for now, let's just log it to see if this is the issue.
        console.warn("⚠️ Warning: Creating player without a Team ID. Coach might not see them.");
    }

    const client = await clerkClient();

    // Standardize Name
    const nameParts = data.name.trim().split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

    // 1. Create Clerk User
    const clerkUser = await client.users.createUser({
      username: data.username, 
      password: passwordToUse,
      firstName: firstName,
      lastName: lastName,
      emailAddress: [data.email || data.parentEmail], 
      publicMetadata: { role: "player" },
    });

    await prisma.$transaction(async (tx) => {
      // 2. Create User
      await tx.user.create({
        data: {
          id: clerkUser.id,
          userCode: data.username,
          name: data.name,
          email: data.email || data.parentEmail,
          phone: data.phone,
          role: "PLAYER",
          photo: typeof data.img === "string" ? data.img : null,
        },
      });

      // 3. Create Profile
      await tx.playerProfile.create({
        data: {
          userId: clerkUser.id,
          dob: new Date(data.dob),
          gender: data.gender,
          jerseyNumber: parseInt(data.jerseyNumber) || 0,
          address: data.address,
          parentEmail: data.parentEmail,
          
          // ✅ CRITICAL FIX: Ensure Team ID is passed correctly
          teamId: (data.teamId && data.teamId !== "") ? data.teamId : undefined,
        },
      });
    });

    revalidatePath("/list/players");
    return { success: true, error: false, message: "Player Created!" };

  } catch (err: any) {
    console.error("Create Player Error:", err);
    if (err.errors && err.errors.length > 0) {
      return { success: false, error: true, message: err.errors[0].longMessage };
    }
    return { success: false, error: true, message: "Error creating player." };
  }
};
export const updatePlayer = async (data: any): Promise<ResponseState> => {
  if (!data.id) return { success: false, error: true, message: "Player ID missing" };

  try {
    const existingProfile = await prisma.playerProfile.findUnique({
      where: { id: data.id },
      select: { userId: true }
    });

    if (!existingProfile) {
      return { success: false, error: true, message: "Player profile not found" };
    }

    const userId = existingProfile.userId;
    const client = await clerkClient();

    // 🔥 UPDATE CLERK NAME (Standardized)
    try {
        const nameParts = data.name.trim().split(" ");
        const firstName = nameParts[0];
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";
        
        await client.users.updateUser(userId, {
            firstName: firstName,
            lastName: lastName
        });
    } catch(e) { console.log("Clerk update skipped", e); }


    await prisma.$transaction(async (tx) => {
        // 1. Update User Info (Full Name)
        await tx.user.update({
            where: { id: userId },
            data: {
                name: data.name, // ✅ Update Full Name
                email: data.email || data.parentEmail,
                photo: typeof data.img === "string" ? data.img : undefined,
                phone: data.phone,
            }
        });

        // 2. Update Player Profile
        await tx.playerProfile.update({
            where: { id: data.id },
            data: {
                dob: new Date(data.dob),
                gender: data.gender,
                jerseyNumber: parseInt(data.jerseyNumber) || 0,
                address: data.address,
                parentEmail: data.parentEmail,
                
                // Handle Team Change (or Removal)
                teamId: (data.teamId && data.teamId !== "") ? data.teamId : null, 
            }
        });
    });

    revalidatePath("/list/players");
    revalidatePath(`/list/players/${data.id}`);
    
    return { success: true, error: false, message: "Player updated successfully!" };
  } catch (err) {
    console.error(err);
    return { success: false, error: true, message: "Error updating player." };
  }
};

// export const deletePlayer = async (id: string): Promise<ResponseState> => {
//   try {
//     // 1. Get User ID from Profile ID
//     const profile = await prisma.playerProfile.findUnique({ 
//         where: { id },
//         select: { userId: true }
//     });
    
//     if (!profile) return { success: false, error: true, message: "Player not found" };

//     // 2. Delete from Clerk
//     const client = await clerkClient();
//     try { 
//         await client.users.deleteUser(profile.userId); 
//     } catch (e) { console.log("Clerk user already deleted or not found"); }

//     // 3. Delete from DB (User table delete cascades to Profile)
//     await prisma.user.delete({ where: { id: profile.userId } }); 
    
//     revalidatePath("/list/players");
//     return { success: true, error: false, message: "Player deleted." };
//   } catch (err) {
//     console.error(err);
//     return { success: false, error: true, message: "Error deleting player." };
//   }
// };

export const deletePlayer = async (playerProfileId: string) => {
  try {
    await ensureAdmin();

    const profile = await prisma.playerProfile.findUnique({
      where: { id: playerProfileId },
      select: { userId: true }
    });

    if (!profile) {
      return { success: false, error: true, message: "Player not found" };
    }

    const userId = profile.userId;

    // ✅ STEP 1: DB CLEANUP FIRST
    await prisma.$transaction(async (tx) => {
      await tx.assignment.deleteMany({ where: { playerId: playerProfileId } });
      await tx.evaluation.deleteMany({ where: { playerId: playerProfileId } });
      await tx.announcement.deleteMany({ where: { audience: playerProfileId } });
      await tx.playerProfile.delete({ where: { id: playerProfileId } });
      await tx.user.delete({ where: { id: userId } });
    });

    // ✅ STEP 2: CLERK DELETE LAST
    const client = await clerkClient();
    try {
      await client.users.deleteUser(userId);
    } catch {}

    revalidatePath("/list/players");

    return { success: true, error: false, message: "Player deleted successfully" };
  } catch (err: any) {
    console.error(err);
    return { success: false, error: true, message: err.message };
  }
};




// ==========================================
// 3. TEAM ACTIONS
// ==========================================

export const createTeam = async (data: any): Promise<ResponseState> => {
  try {
    const existingTeam = await prisma.team.findUnique({
        where: { code: data.code }
    });
    if (existingTeam) {
        return { success: false, error: true, message: "Team code already exists!" };
    }

    await prisma.$transaction(async (tx) => {
        // 1. Create Team
        const newTeam = await tx.team.create({
            data: {
                name: data.name,
                code: data.code,
                ageGroup: data.ageGroup,
            }
        });

        // 2. Assign Head Coach (if selected)
        if (data.coachId && data.coachId !== "") {
            await tx.coachTeam.create({
                data: {
                    teamId: newTeam.id,
                    coachId: data.coachId
                }
            });
        }
    });

    revalidatePath("/list/teams");
    return { success: true, error: false, message: "Team created successfully!" };
  } catch (err) {
    console.log("Create Team Error:", err);
    return { success: false, error: true, message: "Error creating team." };
  }
};

export const updateTeam = async (data: any): Promise<ResponseState> => {
  if (!data.id) return { success: false, error: true, message: "Team ID missing" };
  
  try {
    await prisma.$transaction(async (tx) => {
        // 1. Update Basic Info
        await tx.team.update({
            where: { id: data.id },
            data: {
                name: data.name,
                code: data.code,
                ageGroup: data.ageGroup,
            }
        });

        // 2. Update Head Coach
        // Logic: If a coachId is provided, we remove ALL existing coaches for this team
        // and assign the new one. This enforces the "Head Coach" dropdown UI.
        if (data.coachId !== undefined) {
             // First, remove existing links
             await tx.coachTeam.deleteMany({
                 where: { teamId: data.id }
             });

             // Then, add new link if not empty
             if (data.coachId !== "") {
                 await tx.coachTeam.create({
                     data: {
                         teamId: data.id,
                         coachId: data.coachId
                     }
                 });
             }
        }
    });

    revalidatePath("/list/teams");
    return { success: true, error: false, message: "Team updated successfully!" };
  } catch (err) {
    console.log("Update Team Error:", err);
    return { success: false, error: true, message: "Error updating team." };
  }
};

export const deleteTeam = async (id: string): Promise<ResponseState> => {
  try {
    await prisma.$transaction(async (tx) => {
        
        // 1. Unlink Players (Don't delete them, just set team to null)
        await tx.playerProfile.updateMany({
            where: { teamId: id },
            data: { teamId: null }
        });

        // 2. Remove Coach Links
        await tx.coachTeam.deleteMany({
            where: { teamId: id }
        });

        // 3. 🔥 NEW: Delete Associated Events (Calendar Items)
        // This was the missing piece causing your error
        await tx.event.deleteMany({
            where: { teamId: id }
        });

        // 4. Finally, Delete the Team
        await tx.team.delete({
            where: { id: id }
        });
    });

    revalidatePath("/list/teams");
    return { success: true, error: false, message: "Team and its events deleted successfully." };
  } catch (err) {
    console.error("Delete Team Error:", err);
    return { success: false, error: true, message: "Failed to delete team (Database Error)." };
  }
};

// ==========================================
// 4. DRILL ACTIONS
// ==========================================
export const getMasterDrillList = async () => {
  // Returns just enough info for the dropdown
  return MASTER_DRILLS.map((d) => ({
    id: d.id,
    name: d.name,
    category: d.category
  }));
};

export const getTemplateDetails = async (id: string) => {
  // Yeh function drills.ts se full details + auto-generated video link layega
  const drill = getDrillById(id); 
  return drill;
};

// --- 3. CREATE DRILL ---
export const createDrill = async (data: any): Promise<ResponseState> => {
  try {
    // Check duplicates based on code
    const existing = await prisma.drill.findUnique({ where: { code: data.code }});
    if (existing) return { success: false, error: true, message: "Drill code already exists!" };

    // Handle comma-separated skills if coming from the manual form input
    const skills = typeof data.primarySkills === 'string' 
      ? data.primarySkills.split(",").map((s: string) => s.trim()) 
      : data.primarySkills;

    await prisma.drill.create({
      data: {
        code: data.code,
        name: data.name,
        category: data.category,
        level: data.level,
        primarySkills: skills,
        minAge: parseInt(data.minAge),
        maxAge: parseInt(data.maxAge),
        description: data.description,
        regressionTip: data.regressionTip,
        progressionTip: data.progressionTip,
        videoUrl: data.videoUrl
      },
    });
    revalidatePath("/list/drills");
    return { success: true, error: false, message: "Drill created!" };
  } catch (err) {
    console.error(err);
    return { success: false, error: true, message: "Failed to create drill." };
  }
};

// --- 4. UPDATE DRILL ---
export const updateDrill = async (data: any): Promise<ResponseState> => {
  try {
    const skills = typeof data.primarySkills === 'string' 
      ? data.primarySkills.split(",").map((s: string) => s.trim()) 
      : data.primarySkills;

    await prisma.drill.update({
      where: { id: data.id },
      data: {
        code: data.code,
        name: data.name,
        category: data.category,
        level: data.level,
        primarySkills: skills,
        minAge: parseInt(data.minAge),
        maxAge: parseInt(data.maxAge),
        description: data.description,
        regressionTip: data.regressionTip,
        progressionTip: data.progressionTip,
        videoUrl: data.videoUrl
      },
    });
    revalidatePath("/list/drills");
    return { success: true, error: false, message: "Drill updated!" };
  } catch (err) {
    return { success: false, error: true, message: "Failed to update drill." };
  }
};

// --- 5. DELETE DRILL ---
export const deleteDrill = async (id: string): Promise<ResponseState> => {
  try {
    await prisma.drill.delete({ where: { id } });
    revalidatePath("/list/drills");
    return { success: true, error: false, message: "Drill deleted." };
  } catch (err) {
    return { success: false, error: true, message: "Failed to delete drill." };
  }
};


// ==========================================
// 5. ASSIGNMENT (HOMEWORK) ACTIONS
// ==========================================

export const createAssignment = async (data: any) => {
  try {
    // 1. Safe Integer Parsing (Fixes the 0 issue)
    const currentRating = data.currentRating ? parseInt(data.currentRating.toString()) : 0;
    const goalRating = data.goalRating ? parseInt(data.goalRating.toString()) : 0;
    const estimatedTimeMin = data.estimated_total_time_min ? parseInt(data.estimated_total_time_min.toString()) : 0;

    // 2. Create Assignment
    const newAssignment = await prisma.assignment.create({
      data: {
        playerId: data.playerId,
        coachId: data.coachId,
        template: data.template,
        skillFocus: data.skillFocus,
        currentRating,
        goalRating,
        estimatedTimeMin,
        status: data.status || "PENDING",
        coachFeedback: data.coachFeedback,
        drillItems: data.items || [], 
      }
    });

    // 3. 🔥 CREATE NOTIFICATION (Announcement)
    // This makes it show up on the Player's Profile "Coach Assignments" box
    // Format: "Title |HOMEWORK:ID"
    const coachName = "Coach"; // You can fetch real name if needed, keeping it fast for now
    const notificationTitle = `${coachName} assigned homework: ${data.template} |HOMEWORK:${newAssignment.id}`;

    await prisma.announcement.create({
        data: {
            title: notificationTitle,
            date: new Date(),
            audience: data.playerId, // Target specific player
        }
    });

    revalidatePath("/list/homework");
    revalidatePath(`/list/players/${data.playerId}`);
    
    return { success: true, error: false, message: "Homework assigned & Player notified!" };
  } catch (err) {
    console.error("Create Assignment Error:", err);
    return { success: false, error: true, message: "Failed to assign homework." };
  }
};

export const updateAssignment = async (data: any) => {
  if (!data.id) return { success: false, error: true, message: "ID missing" };

  try {
    const currentRating = data.currentRating ? parseInt(data.currentRating.toString()) : 0;
    const goalRating = data.goalRating ? parseInt(data.goalRating.toString()) : 0;
    const estimatedTimeMin = data.estimated_total_time_min ? parseInt(data.estimated_total_time_min.toString()) : 0;

    await prisma.assignment.update({
      where: { id: data.id },
      data: {
        template: data.template,
        skillFocus: data.skillFocus,
        currentRating,
        goalRating,
        estimatedTimeMin,
        status: data.status,
        coachFeedback: data.coachFeedback,
        drillItems: data.items || [],
      }
    });

    revalidatePath("/list/homework");
    return { success: true, error: false, message: "Homework updated!" };
  } catch (err) {
    console.error("Update Assignment Error:", err);
    return { success: false, error: true, message: "Failed to update homework." };
  }
};

export const deleteAssignment = async (id: string | FormData) => {
  const finalId = typeof id === "string" ? id : (id.get("id") as string);
  
  if (!finalId) return { success: false, error: true, message: "ID Missing" };

  try {
    await prisma.assignment.delete({ where: { id: finalId } });
    revalidatePath("/list/homework");
    return { success: true, error: false, message: "Homework deleted." };
  } catch (err) {
    console.error("Delete Assignment Error:", err);
    return { success: false, error: true, message: "Failed to delete homework." };
  }
};




// ==========================================
// 6. ANNOUNCEMENT ACTIONS
// ==========================================

export const createAnnouncement = async (data: any): Promise<ResponseState> => {
  try {
    await prisma.announcement.create({
      data: {
        title: data.title,
        audience: data.audience,
        date: new Date(data.date),
      },
    });
    revalidatePath("/list/announcements");
    return { success: true, error: false, message: "Announcement posted!" };
  } catch (err) {
    console.error(err);
    return { success: false, error: true, message: "Failed to post announcement." };
  }
};

export const updateAnnouncement = async (data: any): Promise<ResponseState> => {
  try {
    await prisma.announcement.update({
      where: { id: data.id },
      data: {
        title: data.title,
        audience: data.audience,
        date: new Date(data.date),
      },
    });
    revalidatePath("/list/announcements");
    return { success: true, error: false, message: "Announcement updated!" };
  } catch (err) {
    return { success: false, error: true, message: "Failed to update announcement." };
  }
};

export const deleteAnnouncement = async (id: string): Promise<ResponseState> => {
  try {
    await prisma.announcement.delete({ where: { id } });
    revalidatePath("/list/announcements");
    return { success: true, error: false, message: "Announcement deleted." };
  } catch (err) {
    return { success: false, error: true, message: "Failed to delete announcement." };
  }
};


// ==========================================
// 7. EVALUATION ACTIONS
// ==========================================
const calculateCategoryStats = (input: any): number => {
  if (input === undefined || input === null) return 0;

  let score = 0;
  if (typeof input === 'number' || (typeof input === 'string' && !isNaN(Number(input)))) {
      score = Number(input);
  } 
  else if (typeof input === 'object') {
      const values = Object.values(input).map((v) => Number(v) || 0);
      if (values.length > 0) {
          const sum = values.reduce((a, b) => a + b, 0);
          score = sum / values.length;
      }
  }
  if (score > 10) score = score / 10;
  
  return Math.round(score);
};


export const createEvaluation = async (data: any) => {
  try {
    // Expecting data.ratingsJson from the form
    const ratings = data.ratingsJson || {};

    // Calculate Stats using the smart helper
    const technical = calculateCategoryStats(ratings.technical);
    const tactical = calculateCategoryStats(ratings.tactical);
    const physical = calculateCategoryStats(ratings.physical);
    const mental = calculateCategoryStats(ratings.mental);
    
    // Direct values
    const attacking = calculateCategoryStats(ratings.attacking);
    const defending = calculateCategoryStats(ratings.defending);

    await prisma.evaluation.create({
      data: {
        playerId: data.playerId,
        coachId: data.coachId,
        date: new Date(),
        
        technical,
        tactical,
        physical,
        mental,
        attacking,
        defending,

        ratingsJson: ratings,
        note: data.note || "",
        
        overallJson: {
            technical, tactical, physical, mental, attacking, defending,
            overall: Number(((technical + tactical + physical + mental) / 4).toFixed(1))
        }
      },
    });

    revalidatePath("/list/evaluations");
    if (data.playerId) revalidatePath(`/list/players/${data.playerId}`);
    return { success: true, error: false, message: "Evaluation created successfully!" };

  } catch (err) {
    console.error("Create Eval Error:", err);
    return { success: false, error: true, message: "Failed to create evaluation." };
  }
};

export const updateEvaluation = async (data: any) => {
  if (!data.id) return { success: false, error: true, message: "ID missing" };

  try {
    const ratings = data.subScores || data.ratingsJson || {};

    // 2. Calculate Stats (Smart helper handles both structures)
    const technical = calculateCategoryStats(ratings.technical);
    const tactical = calculateCategoryStats(ratings.tactical);
    const physical = calculateCategoryStats(ratings.physical);
    const mental = calculateCategoryStats(ratings.mental);
    
    const attacking = calculateCategoryStats(ratings.attacking);
    const defending = calculateCategoryStats(ratings.defending);

    // 3. Update Database
    await prisma.evaluation.update({
      where: { id: data.id },
      data: {
        // Update Columns
        technical,
        tactical,
        physical,
        mental,
        attacking,
        defending,

        // Save Full Data (Preserve structure)
        ratingsJson: ratings,
        note: data.note,
        
        // Update Overall
        overallJson: {
            technical, tactical, physical, mental, attacking, defending,
            overall: Number(((technical + tactical + physical + mental) / 4).toFixed(1))
        }
      },
    });

    revalidatePath("/list/evaluations");
    if (data.playerId) revalidatePath(`/list/players/${data.playerId}`);
    
    return { success: true, error: false, message: "Evaluation updated successfully!" };
  } catch (err) {
    console.error("Update Eval Error:", err);
    return { success: false, error: true, message: "Error updating evaluation." };
  }
};

export const deleteEvaluation = async (id: string | FormData) => {
  // Handle both direct ID string OR FormData (from HTML forms)
  const finalId = typeof id === "string" ? id : (id.get("id") as string);

  try {
    await prisma.evaluation.delete({ where: { id: finalId } });
    revalidatePath("/list/evaluations");
    return { success: true, error: false, message: "Evaluation deleted." };
  } catch (err) {
    console.error("Delete Eval Error:", err);
    return { success: false, error: true, message: "Failed to delete evaluation." };
  }
};





// ==========================================
// 8. ASSIGN DRILL TO PLAYER
// ==========================================
export const assignDrillToPlayer = async (data: { drillId: string; drillName: string; playerId: string; coachId: string }) => {
  try {
    // 1. Find Player
    const player = await prisma.playerProfile.findUnique({ 
        where: { id: data.playerId }, 
        include: { user: true } 
    });

    if (!player) {
        return { success: false, error: true, message: "Player not found in database." };
    }

    // 2. Find Coach (Optional - Fallback if not found)
    let coachName = "The Coach";
    if (data.coachId) {
        const coach = await prisma.coachProfile.findUnique({ 
            where: { id: data.coachId }, 
            include: { user: true } 
        });
        if (coach) {
            coachName = `Coach ${coach.user.name}`;
        }
    }

    // 3. Create Message
    // Format: "Coach Name assigned: Drill Name |DRILL:123"
    const messageContent = `${coachName} assigned: ${data.drillName}`;
    const hiddenPayload = `|DRILL:${data.drillId}`; 
    const fullTitle = messageContent + hiddenPayload;

    // 4. Save to Database
    await prisma.announcement.create({
        data: {
            title: fullTitle,
            audience: data.playerId, // ✅ Important: Link to specific player ID
            date: new Date(),
        }
    });

    console.log(`[ASSIGNMENT] Success: ${fullTitle} -> ${player.user.name}`);

    revalidatePath(`/list/players/${data.playerId}`);
    return { success: true, error: false, message: `Drill assigned to ${player.user.name}!` };

  } catch (err) {
    console.error("Assign Error:", err);
    return { success: false, error: true, message: "Failed to assign drill." };
  }
};



// ==========================================
// 9. PROFILE SETUP
// ==========================================
import { currentUser } from "@clerk/nextjs/server";
export const updateCurrentProfile = async (formData: any) => {
  const user = await currentUser();
  if (!user) return { success: false, error: true, message: "Unauthorized" };

  const role = user.publicMetadata.role as string;
  const userId = user.id;

  try {
    if (role === "coach") {
      await prisma.coachProfile.update({
        where: { userId: userId },
        data: {
          // Add fields you want them to be able to edit
          // Note: We don't usually let them change their Name/Email here, 
          // that should be done in Settings/Clerk to keep sync.
          // But we can update phone/address in our DB.
        }
      });
      // Coaches usually don't have extensive profile fields in your schema yet,
      // but you can update User meta if needed or specific Coach fields.
    }

    if (role === "player") {
      await prisma.playerProfile.update({
        where: { userId: userId },
        data: {
          address: formData.address,
          parentEmail: formData.parentEmail,
          // gender, dob usually stay fixed or require admin
        }
      });
    }
    
    // Also update the generic Prisma User phone if provided
    if (formData.phone) {
        // Find the profile ID first to get the relation, or just update directly if you have a User model
        // Assuming you have a generic update on User model:
        /* await prisma.user.update({ where: { id: userId }, data: { phone: formData.phone }}) */
    }

    revalidatePath("/profile");
    return { success: true, error: false, message: "Profile updated successfully!" };
  } catch (err) {
    console.error(err);
    return { success: false, error: true, message: "Failed to update profile." };
  }
};
