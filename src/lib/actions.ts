"use server";
import { Resend } from "resend";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { clerkClient } from "@clerk/nextjs/server";
import { currentUser } from "@clerk/nextjs/server";
import { getDrillById, MASTER_DRILLS } from "@/lib/drills";
import { z } from "zod";
import { sendNotification } from "./automation";

const resend = new Resend(process.env.RESEND_API_KEY);

async function ensureAdmin() {
  const user = await currentUser();
  if (!user || user.publicMetadata.role !== "admin") {
    // throw new Error("Unauthorized: Admin only");
    // Commenting out for dev flexibility, uncomment for production
  }
}

type ResponseState = { success: boolean; error: boolean; message?: string };

// ==========================================
// DATA FETCHERS
// ==========================================

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

export const getAllClubs = async () => {
  try {
    const clubs = await prisma.club.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
    return clubs;
  } catch (err) {
    console.error(err);
    return [];
  }
};

const ClubSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, { message: "Club name must be at least 3 chars" }),
  code: z.string().min(2, { message: "Code is required (e.g. MCI)" }),
  logo: z.string().optional().nullable(), // Stores the Cloudinary URL or null
});

// Response type for form state
export type ClubState = { success: boolean; error: boolean; message: string };

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
  homework: { title: string; desc: string }[];
};

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

export const getPlayerDates = async (playerId: string) => {
  const evaluations = await prisma.evaluation.findMany({
    where: { playerId },
    select: { createdAt: true, id: true },
    orderBy: { createdAt: 'desc' }
  });

  return evaluations.map(e => ({
    id: e.id,
    date: e.createdAt.toISOString().split('T')[0]
  }));
};

const calculateScore = (evalRecord: any, category: string) => {
  if (!evalRecord) return 0;
  if (evalRecord[category] !== undefined && evalRecord[category] !== null && evalRecord[category] > 0) {
    return evalRecord[category];
  }
  try {
    const json = evalRecord.ratingsJson as any;
    if (!json) return 0;
    const target = json[category];
    if (typeof target === 'number') return target;
    if (typeof target === 'string' && !isNaN(Number(target))) return Number(target);
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

// ==========================================
// FLIP CARD ACTIONS
// ==========================================

// export const createFlipCard = async (
//   playerId: string,
//   coachId: string,
//   data: FlipCardData
// ) => {
//   try {
//     const getVal = (name: string) => data.stats.find(s => s.name === name)?.value || 0;

//     const tech = getVal("Technical");
//     const tact = getVal("Tactical");
//     const phys = getVal("Physical");
//     const ment = getVal("Mental");
//     const att = getVal("Attacking");
//     const def = getVal("Defending");

//     await prisma.flipCard.create({
//       data: {
//         title: `Performance Card - ${new Date().toLocaleDateString()}`,
//         content: data as any,
//         playerId: playerId,
//         coachId: coachId,
//       },
//     });

//     await prisma.evaluation.create({
//         data: {
//             playerId: playerId,
//             coachId: coachId,
//             technical: tech,
//             tactical: tact,
//             physical: phys,
//             mental: ment,
//             attacking: att, 
//             defending: def,
//             ratingsJson: {
//                 technical: { "Score": tech },
//                 tactical: { "Score": tact },
//                 physical: { "Score": phys },
//                 mental: { "Score": ment },
//                 attacking: att,
//                 defending: def
//             },
//             note: "Auto-generated from Performance FlipCard.",
//         }
//     });

//     // 🔥 AUTOMATION: Evaluation via FlipCard
//     // Fetch player info for notification
//     const playerInfo = await prisma.playerProfile.findUnique({
//         where: { id: playerId },
//         include: { user: true }
//     });

//     if (playerInfo) {
//         sendNotification('EVALUATION_SUBMITTED', {
//             playerName: playerInfo.user.name,
//             parentEmail: playerInfo.parentEmail,
//             scores: { technical: tech, tactical: tact, physical: phys },
//             coachNote: "Auto-generated from Performance FlipCard",
//             source: "FlipCard"
//         });
//     }

//     revalidatePath(`/list/players/${playerId}`);
//     revalidatePath(`/list/evaluations`);

//     return { success: true, message: "Card & Evaluation Created!" };
//   } catch (err) {
//     console.log("Error creating card:", err);
//     return { success: false, message: "Failed to create card" };
//   }
// };

type SkillItem = { name: string; current: number; goal: number };
type StatCategory = SkillItem[];
type OverallStat = { current: number; goal: number };

export type FlipCardPayload = {
  overallScore: string;
  stats: {
    technical: StatCategory;
    tactical: StatCategory;
    physical: StatCategory;
    mental: StatCategory;
    attacking: OverallStat;
    defending: OverallStat;
  };
  drills: any;
};

export const createFlipCard = async (
  playerId: string,
  coachId: string,
  data: FlipCardPayload
) => {
  try {
    // --- 2. DATA PREPARATION (Fixing the logic to work with new Objects) ---
    // Old logic: data.stats.find(...) -> Won't work because stats is now an object, not an array.
    // New logic: Calculate averages from the arrays.

    const calcAvg = (arr: StatCategory) => {
      if (!arr || arr.length === 0) return 0;
      const sum = arr.reduce((acc, item) => acc + (Number(item.current) || 0), 0);
      return Number((sum / arr.length).toFixed(1));
    };

    const tech = calcAvg(data.stats.technical);
    const tact = calcAvg(data.stats.tactical);
    const phys = calcAvg(data.stats.physical);
    const ment = calcAvg(data.stats.mental);

    // For Attacking/Defending, we take the direct value
    const att = Number(data.stats.attacking?.current) || 0;
    const def = Number(data.stats.defending?.current) || 0;

    // --- 3. DATABASE: CREATE FLIP CARD ---
    await prisma.flipCard.create({
      data: {
        title: `Performance Card - ${new Date().toLocaleDateString()}`,
        // REMOVED 'date': Your schema uses createdAt automatically
        content: data as any,
        playerId: playerId,
        coachId: coachId,
      },
    });

    // --- 4. DATABASE: CREATE EVALUATION ---
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
        // If your Evaluation model doesn't have 'date', remove this line too:
        date: new Date()
      }
    });

    // --- 5. NOTIFICATIONS (Restored your logic) ---
    const playerInfo = await prisma.playerProfile.findUnique({
      where: { id: playerId },
      include: { user: true }
    });

    // --- 6. DATABASE: CREATE ANNOUNCEMENT ---
    if (data.drills && data.drills.primary) {
      await prisma.announcement.create({
        data: {
          // We combine title & description because 'description' field might not exist
          title: `DRILL: ${data.drills.primary} | ${data.drills.primaryDetails || "Check card"}`,
          date: new Date(),

          // FIXED: Added 'audience' because the error says it is REQUIRED
          audience: playerId
        }
      });
    }

    // --- 7. REVALIDATE ---
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

  const categories = ['technical', 'tactical', 'physical', 'mental', 'attacking', 'defending'];

  const chartData = categories.map(cat => ({
    subject: cat.charAt(0).toUpperCase() + cat.slice(1),
    A: calculateScore(evalA, cat),
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
  subScores: Record<string, Record<string, number>>;
  note?: string;
}

export const createFullEvaluation = async (data: EvaluationFormData) => {
  const categories = ["technical", "tactical", "physical", "mental"];
  const averages: Record<string, number> = {};

  categories.forEach(cat => {
    const skills = data.subScores[cat];
    if (skills) {
      const values = Object.values(skills);
      const sum = values.reduce((a, b) => a + b, 0);
      averages[cat] = values.length > 0 ? Math.round(sum / values.length) : 0;
    } else {
      averages[cat] = 0;
    }
  });

  try {
    await prisma.evaluation.create({
      data: {
        playerId: data.playerId,
        coachId: data.coachId,
        technical: averages.technical || 0,
        tactical: averages.tactical || 0,
        physical: averages.physical || 0,
        mental: averages.mental || 0,
        attacking: averages.technical || 0,
        defending: averages.tactical || 0,
        ratingsJson: data.subScores,
        note: data.note
      }
    });

    // 🔥 AUTOMATION: Full Evaluation
    const playerInfo = await prisma.playerProfile.findUnique({
      where: { id: data.playerId },
      include: { user: true }
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
    const passwordToUse = (data.password && data.password.length >= 8) ? data.password : "Coach@123!";

    // 1. Create User in Clerk
    const client = await clerkClient();
    const clerkUser = await client.users.createUser({
      username: data.username,
      password: passwordToUse,
      firstName: data.name.split(" ")[0],
      lastName: data.name.split(" ").slice(1).join(" "),
      emailAddress: [data.email],
      publicMetadata: { role: "coach" },
    });

    // 2. Create User in Database (Prisma)
    await prisma.$transaction(async (tx) => {
      await tx.user.create({
        data: {
          id: clerkUser.id,

          // 🔥 FIX IS HERE: PASS THE USERNAME TO PRISMA
          username: data.username,

          userCode: data.username, // Keeping this same as username for now
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

      if (data.specialties && typeof data.specialties === 'string') {
        const specs = data.specialties.split(',').map((s: string) => s.trim()).filter((s: string) => s !== "");
        for (const specName of specs) {
          const specialty = await tx.specialty.upsert({
            where: { name: specName },
            update: {},
            create: { name: specName }
          });
          await tx.coachSpecialty.create({
            data: { coachId: profile.id, specialtyId: specialty.id }
          });
        }
      }
    });

    // 🔥 AUTOMATION: Coach Created
    await sendNotification('COACH_CREATED', {
      entity: "COACH",
      action: "CREATED",
      body: {
        name: data.name,
        email: data.email,
        username: data.username,
        tempPassword: passwordToUse
      }
    });

    revalidatePath("/list/coaches");
    return { success: true, error: false, message: `Coach Created! Pass: ${passwordToUse}` };

  } catch (err: any) {
    console.error("Create Error:", err);
    // Handle Clerk errors (like "Username taken")
    if (err.errors && err.errors.length > 0) {
      return { success: false, error: true, message: err.errors[0].longMessage };
    }
    return { success: false, error: true, message: "Failed to create coach." };
  }
};

export const updateCoach = async (data: any): Promise<ResponseState> => {
  if (!data.id) return { success: false, error: true, message: "ID missing" };

  try {
    const existingProfile = await prisma.coachProfile.findUnique({
      where: { id: data.id },
      select: { userId: true }
    });

    if (!existingProfile) return { success: false, error: true, message: "Coach not found" };

    const userId = existingProfile.userId;
    const client = await clerkClient();

    // 🔥 FIX: Password Update Logic Added Here
    try {
      const clerkUpdateData: any = {
        firstName: data.name.split(" ")[0],
        lastName: data.name.split(" ").slice(1).join(" "),
      };

      // Agar password 8 chars se bada hai, tabhi update karo
      if (data.password && data.password.trim() !== "" && data.password.length >= 8) {
        clerkUpdateData.password = data.password;
      }

      await client.users.updateUser(userId, clerkUpdateData);

    } catch (e) {
      console.log("Clerk update skipped or Password weak:", e);
      // Optional: Return error if password fails (e.g. too weak)
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          userCode: data.username, // Username update DB mein
          photo: typeof data.img === "string" ? data.img : undefined,
        },
      });

      // ... Baki teams aur specialty wala code SAME rahega ...
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

      await tx.coachSpecialty.deleteMany({ where: { coachId: data.id } });
      if (data.specialties && typeof data.specialties === 'string') {
        const specs = data.specialties.split(',').map((s: string) => s.trim()).filter((s: string) => s !== "");
        for (const specName of specs) {
          const specialty = await tx.specialty.upsert({
            where: { name: specName },
            update: {},
            create: { name: specName }
          });
          await tx.coachSpecialty.create({
            data: { coachId: data.id, specialtyId: specialty.id }
          });
        }
      }
    });

    // 🔥 AUTOMATION: Coach Updated
    await sendNotification('COACH_UPDATED', {
      entity: "COACH",
      action: "UPDATED",
      body: {
        id: data.id,
        name: data.name,
        email: data.email,
        // Password change hua ya nahi, ye log mein dikha sakte ho
        passwordChanged: !!(data.password && data.password.length >= 8)
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
    const profile = await prisma.coachProfile.findUnique({
      where: { id: id },
      select: { userId: true, id: true, user: { select: { name: true, email: true } } }
    });

    if (!profile) {
      return { success: false, error: true, message: "Coach not found." };
    }

    const client = await clerkClient();
    try {
      await client.users.deleteUser(profile.userId);
    } catch (e) { console.log("Clerk User not found or already deleted"); }

    await prisma.$transaction(async (tx) => {
      await tx.coachTeam.deleteMany({ where: { coachId: profile.id } });
      await tx.coachSpecialty.deleteMany({ where: { coachId: profile.id } });
      await tx.assignment.deleteMany({ where: { coachId: profile.id } });
      await tx.evaluation.deleteMany({ where: { coachId: profile.id } });
      await tx.user.delete({ where: { id: profile.userId } });
    });

    // 🔥 AUTOMATION: Coach Deleted
    await sendNotification('COACH_DELETED', {
      entity: "COACH",
      action: "DELETED",
      body: {
        id: id,
        name: profile.user.name,
        email: profile.user.email
      }
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
    // 1. Password Safety Check
    const passwordToUse = (data.password && data.password.length >= 8)
      ? data.password
      : "Player@123!";

    // 2. Username Validation
    if (!data.username) {
      return { success: false, error: true, message: "Username is required!" };
    }

    const client = await clerkClient();

    // 3. Create User in Clerk
    let clerkUser;
    try {
      clerkUser = await client.users.createUser({
        username: data.username,
        password: passwordToUse,
        firstName: data.name.split(" ")[0],
        lastName: data.name.split(" ").slice(1).join(" ") || "",
        emailAddress: [data.email || data.parentEmail],
        publicMetadata: { role: "player" },
      });
    } catch (clerkErr: any) {
      console.error("Clerk Create Error:", clerkErr);
      // Agar username already taken hai, toh user ko batao
      if (clerkErr.errors && clerkErr.errors[0]?.code === 'form_identifier_exists') {
        return { success: false, error: true, message: `Username or Email is already taken. Try a different one.` };
      }
      return { success: false, error: true, message: "Clerk Error: " + (clerkErr.errors?.[0]?.message || "Failed to create account") };
    }

    // 4. Create User in Database (Prisma)
    await prisma.$transaction(async (tx) => {
      await tx.user.create({
        data: {
          id: clerkUser.id,
          // 🔥 MOST IMPORTANT: Username DB mein bhejna zaroori hai
          username: data.username,
          userCode: data.username,
          name: data.name,
          email: data.email || data.parentEmail,
          phone: data.phone,
          role: "PLAYER",
          photo: typeof data.img === "string" ? data.img : null,
        },
      });

      await tx.playerProfile.create({
        data: {
          userId: clerkUser.id,
          dob: new Date(data.dob),
          gender: data.gender,
          jerseyNumber: parseInt(data.jerseyNumber) || 0,
          address: data.address,
          parentEmail: data.parentEmail,
          teamId: (data.teamId && data.teamId !== "") ? data.teamId : undefined,
        },
      });
    });

    // 5. Automation Notification
    await sendNotification('PLAYER_CREATED', {
      entity: "PLAYER",
      action: "CREATED",
      body: {
        name: data.name,
        username: data.username,
        password: passwordToUse, // Log password for testing
        email: data.email || data.parentEmail,
      }
    });

    revalidatePath("/list/players");
    return { success: true, error: false, message: "Player Created Successfully!" };

  } catch (err: any) {
    console.error("Database Create Error:", err);
    // Agar DB mein duplicate entry ka error aaye
    if (err.code === 'P2002') {
      return { success: false, error: true, message: "Username or Email already exists in Database." };
    }
    return { success: false, error: true, message: "Database Error: Failed to save player." };
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

    // 🔥 FIX STARTS HERE: Update Username & Password in Clerk
    try {
      const clerkUpdateData: any = {
        firstName: data.name.split(" ")[0],
        lastName: data.name.split(" ").slice(1).join(" "),
        username: data.username, // ✅ Username update add kiya
      };

      // ✅ Password tabhi update karein jab user ne naya dala ho
      if (data.password && data.password.trim().length >= 8) {
        clerkUpdateData.password = data.password;
      }

      await client.users.updateUser(userId, clerkUpdateData);

    } catch (e: any) {
      console.error("Clerk Update Failed:", e);
      // Agar username taken hai toh user ko batao
      if (e.errors && e.errors[0]?.code === 'form_identifier_exists') {
        return { success: false, error: true, message: "Username already taken on Clerk!" };
      }
      // Password weak error
      if (e.errors && e.errors[0]?.code === 'password_pwned') {
        return { success: false, error: true, message: "Password is too weak/common." };
      }
    }
    // 🔥 FIX ENDS HERE

    // Database Update (Prisma)
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: {
          name: data.name,
          username: data.username, // DB mein bhi sync karo
          userCode: data.username,
          email: data.email || data.parentEmail,
          photo: typeof data.img === "string" ? data.img : undefined,
          phone: data.phone,
        }
      });

      await tx.playerProfile.update({
        where: { id: data.id },
        data: {
          dob: new Date(data.dob),
          gender: data.gender,
          jerseyNumber: parseInt(data.jerseyNumber) || 0,
          address: data.address,
          parentEmail: data.parentEmail,
          teamId: (data.teamId && data.teamId !== "") ? data.teamId : null,
        }
      });
    });

    // Automation Notification
    await sendNotification('PLAYER_UPDATED', {
      entity: "PLAYER",
      action: "UPDATED",
      body: {
        id: data.id,
        name: data.name,
        email: data.email || data.parentEmail,
        passwordChanged: !!(data.password && data.password.length >= 8)
      }
    });

    revalidatePath("/list/players");
    revalidatePath(`/list/players/${data.id}`);

    return { success: true, error: false, message: "Player updated successfully!" };
  } catch (err) {
    console.error(err);
    return { success: false, error: true, message: "Error updating player." };
  }
};

export const deletePlayer = async (playerProfileId: string) => {
  try {
    await ensureAdmin();

    const profile = await prisma.playerProfile.findUnique({
      where: { id: playerProfileId },
      select: { userId: true, user: { select: { name: true } } }
    });

    if (!profile) {
      return { success: false, error: true, message: "Player not found" };
    }

    const userId = profile.userId;

    // DB CLEANUP FIRST
    await prisma.$transaction(async (tx) => {
      await tx.assignment.deleteMany({ where: { playerId: playerProfileId } });
      await tx.evaluation.deleteMany({ where: { playerId: playerProfileId } });
      await tx.announcement.deleteMany({ where: { audience: playerProfileId } });
      await tx.flipCard.deleteMany({ where: { playerId: playerProfileId } });
      await tx.playerProfile.delete({ where: { id: playerProfileId } });
      await tx.user.delete({ where: { id: userId } });
    });

    // CLERK DELETE LAST
    const client = await clerkClient();
    try {
      await client.users.deleteUser(userId);
    } catch { }

    // 🔥 AUTOMATION: Player Deleted
    // 🔥 AUTOMATION: Player Deleted
    await sendNotification('PLAYER_DELETED', { // Added 'await'
      entity: "PLAYER",
      action: "DELETED",
      body: {             // ✅ WRAP DATA INSIDE BODY
        id: playerProfileId,
        name: profile.user.name
      }
    });
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

export const createTeam = async (data: any) => {
  try {
    const existingTeam = await prisma.team.findUnique({
      where: { code: data.code }
    });
    if (existingTeam) {
      return { success: false, error: true, message: "Team code already exists!" };
    }

    const createdTeam = await prisma.$transaction(async (tx) => {
      const newTeam = await tx.team.create({
        data: {
          name: data.name,
          code: data.code,
          ageGroup: data.ageGroup,
          clubId: data.clubId || null, // 🔥 Save Club ID
        }
      });

      if (data.coachId && data.coachId !== "") {
        await tx.coachTeam.create({
          data: {
            teamId: newTeam.id,
            coachId: data.coachId
          }
        });
      }
      return newTeam;
    });

    // ... notification logic ...

    revalidatePath("/list/teams");
    return { success: true, error: false, message: "Team created successfully!" };
  } catch (err) {
    console.log("Create Team Error:", err);
    return { success: false, error: true, message: "Error creating team." };
  }
};

export const updateTeam = async (data: any) => {
  if (!data.id) return { success: false, error: true, message: "Team ID missing" };

  try {
    await prisma.$transaction(async (tx) => {
      await tx.team.update({
        where: { id: data.id },
        data: {
          name: data.name,
          code: data.code,
          ageGroup: data.ageGroup,
          clubId: data.clubId || null, // 🔥 Update Club ID
        }
      });

      if (data.coachId !== undefined) {
        await tx.coachTeam.deleteMany({
          where: { teamId: data.id }
        });
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
      await tx.playerProfile.updateMany({
        where: { teamId: id },
        data: { teamId: null }
      });

      await tx.coachTeam.deleteMany({
        where: { teamId: id }
      });

      await tx.event.deleteMany({
        where: { teamId: id }
      });

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
  return MASTER_DRILLS.map((d) => ({
    id: d.id,
    name: d.name,
    category: d.category
  }));
};

export const getTemplateDetails = async (id: string) => {
  const drill = getDrillById(id);
  return drill;
};

export const createDrill = async (data: any): Promise<ResponseState> => {
  try {
    const existing = await prisma.drill.findUnique({ where: { code: data.code } });
    if (existing) return { success: false, error: true, message: "Drill code already exists!" };

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
    const currentRating = data.currentRating ? parseInt(data.currentRating.toString()) : 0;
    const goalRating = data.goalRating ? parseInt(data.goalRating.toString()) : 0;
    const estimatedTimeMin = data.estimated_total_time_min ? parseInt(data.estimated_total_time_min.toString()) : 0;

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

    const coachName = "Coach";
    const notificationTitle = `${coachName} assigned homework: ${data.template} |HOMEWORK:${newAssignment.id}`;

    await prisma.announcement.create({
      data: {
        title: notificationTitle,
        date: new Date(),
        audience: data.playerId,
      }
    });

    // 🔥 AUTOMATION: Homework Assigned
    // Fetch player info to send email
    const playerInfo = await prisma.playerProfile.findUnique({
      where: { id: data.playerId },
      include: { user: true }
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
    const ratings = data.ratingsJson || {};

    const technical = calculateCategoryStats(ratings.technical);
    const tactical = calculateCategoryStats(ratings.tactical);
    const physical = calculateCategoryStats(ratings.physical);
    const mental = calculateCategoryStats(ratings.mental);
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

    // 🔥 AUTOMATION: Evaluation Submitted
    const playerInfo = await prisma.playerProfile.findUnique({
      where: { id: data.playerId },
      include: { user: true }
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

    const technical = calculateCategoryStats(ratings.technical);
    const tactical = calculateCategoryStats(ratings.tactical);
    const physical = calculateCategoryStats(ratings.physical);
    const mental = calculateCategoryStats(ratings.mental);

    const attacking = calculateCategoryStats(ratings.attacking);
    const defending = calculateCategoryStats(ratings.defending);

    await prisma.evaluation.update({
      where: { id: data.id },
      data: {
        technical,
        tactical,
        physical,
        mental,
        attacking,
        defending,
        ratingsJson: ratings,
        note: data.note,
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
    const player = await prisma.playerProfile.findUnique({
      where: { id: data.playerId },
      include: { user: true }
    });

    if (!player) {
      return { success: false, error: true, message: "Player not found in database." };
    }

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

    const messageContent = `${coachName} assigned: ${data.drillName}`;
    const hiddenPayload = `|DRILL:${data.drillId}`;
    const fullTitle = messageContent + hiddenPayload;

    await prisma.announcement.create({
      data: {
        title: fullTitle,
        audience: data.playerId,
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

export const updateCurrentProfile = async (formData: any) => {
  const user = await currentUser();
  if (!user) return { success: false, error: true, message: "Unauthorized" };

  const role = user.publicMetadata.role as string;
  const userId = user.id;

  try {
    if (role === "coach") {
      await prisma.coachProfile.update({
        where: { userId: userId },
        data: {}
      });
    }

    if (role === "player") {
      await prisma.playerProfile.update({
        where: { userId: userId },
        data: {
          address: formData.address,
          parentEmail: formData.parentEmail,
        }
      });
    }

    if (formData.phone) {
    }

    revalidatePath("/profile");
    return { success: true, error: false, message: "Profile updated successfully!" };
  } catch (err) {
    console.error(err);
    return { success: false, error: true, message: "Failed to update profile." };
  }
};


//Messages
export async function getUserConversations(userId: string) {
  const conversations = await prisma.conversation.findMany({
    where: {
      participants: { some: { userId } },
    },
    include: {
      participants: {
        include: {
          // 🔥 Added userCode here so we can display identity
          user: { select: { id: true, name: true, photo: true, role: true, userCode: true } }
        },
      },
      messages: {
        take: 1,
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { lastMessageAt: "desc" },
  });

  return conversations;
}

export async function getChatMessages(conversationId: string) {
  return await prisma.message.findMany({
    where: { conversationId },
    include: {
      // 🔥 Added role and userCode here for message bubbles
      sender: { select: { id: true, name: true, photo: true, role: true, userCode: true } },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function sendMessage(formData: FormData) {
  const conversationId = formData.get("conversationId") as string;
  const senderId = formData.get("senderId") as string;
  const content = formData.get("content") as string;
  const attachmentUrl = formData.get("attachmentUrl") as string | null;

  if (!content && !attachmentUrl) return;


  await prisma.message.create({
    data: {
      conversationId,
      senderId,
      content,
      attachmentUrl,
      attachmentType: attachmentUrl ? "IMAGE" : null,
    },
  });


  await prisma.conversation.update({
    where: { id: conversationId },
    data: { lastMessageAt: new Date() },
  });

  revalidatePath("/list/messages");
}

export async function searchUsers(query: string, currentUserId: string) {
  if (!query || query.length < 2) return [];

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { userCode: { contains: query, mode: "insensitive" } },
      ],
      NOT: { id: currentUserId }, // Don't show yourself
    },
    take: 5,
    select: { id: true, name: true, photo: true, userCode: true, role: true },
  });

  return users;
}

export async function createOrGetConversation(currentUserId: string, otherUserId: string) {
  // Check if conversation already exists between these two
  const existingConv = await prisma.conversation.findFirst({
    where: {
      AND: [
        { participants: { some: { userId: currentUserId } } },
        { participants: { some: { userId: otherUserId } } },
        { isGroup: false },
      ],
    },
  });

  if (existingConv) {
    return existingConv.id;
  }

  // If not, create new one
  const newConv = await prisma.conversation.create({
    data: {
      isGroup: false,
      participants: {
        create: [
          { userId: currentUserId },
          { userId: otherUserId },
        ],
      },
    },
  });

  revalidatePath("/messages"); // Refresh the page to show new chat
  return newConv.id;
}

export async function getGlobalChat(currentUserId: string) {
  // 1. Try to find the "General" channel
  let globalChat = await prisma.conversation.findFirst({
    where: {
      isGroup: true,
      name: "General"
    },
    include: {
      participants: { select: { userId: true } }
    }
  });

  // 2. If it doesn't exist, create it (First time setup)
  if (!globalChat) {
    globalChat = await prisma.conversation.create({
      data: {
        isGroup: true,
        name: "General",
        participants: {
          create: { userId: currentUserId }
        }
      },
      include: { participants: { select: { userId: true } } }
    });
  }

  // 3. Ensure Current User is a Participant
  const isParticipant = globalChat.participants.some(p => p.userId === currentUserId);

  if (!isParticipant) {
    await prisma.conversationParticipant.create({
      data: {
        conversationId: globalChat.id,
        userId: currentUserId,
      }
    });
    revalidatePath("/messages");
  }

  // 4. Return the chat ID to open immediately
  return globalChat;
}



//=====CLUB ACTIONS =====//
export const createClub = async (currentState: ClubState, data: z.infer<typeof ClubSchema>): Promise<ClubState> => {
  try {
    // Check for unique code to prevent duplicates
    const existing = await prisma.club.findUnique({ where: { code: data.code } });
    if (existing) return { success: false, error: true, message: "Club code already exists!" };

    await prisma.club.create({
      data: {
        name: data.name,
        code: data.code,
        logo: data.logo || null,
      },
    });

    revalidatePath("/list/club");
    return { success: true, error: false, message: "Club created successfully!" };
  } catch (err) {
    console.error("Create Club Error:", err);
    return { success: false, error: true, message: "Failed to create club" };
  }
};

export const updateClub = async (currentState: ClubState, data: z.infer<typeof ClubSchema>): Promise<ClubState> => {
  if (!data.id) return { success: false, error: true, message: "Club ID is missing" };

  try {
    await prisma.club.update({
      where: { id: data.id },
      data: {
        name: data.name,
        code: data.code,
        logo: data.logo || null,
      },
    });

    revalidatePath("/list/club");
    return { success: true, error: false, message: "Club updated successfully!" };
  } catch (err) {
    console.error("Update Club Error:", err);
    return { success: false, error: true, message: "Failed to update club" };
  }
};

export const deleteClub = async (currentState: ClubState, data: FormData): Promise<ClubState> => {
  const id = data.get("id") as string;
  try {
    await prisma.club.delete({ where: { id } });
    revalidatePath("/list/club");
    return { success: true, error: false, message: "Club deleted!" };
  } catch (err) {
    console.error("Delete Club Error:", err);
    return { success: false, error: true, message: "Failed to delete club. It might have associated teams." };
  }
};