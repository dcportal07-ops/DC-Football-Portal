import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Gender, Role } from '@prisma/client'
import { currentUser, clerkClient } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  console.log("🟢 API HIT: /api/player/import");
  try {
    // 1. Auth Check (Clerk)
    const user = await currentUser();

    if (!user) {
      console.log("🔴 No User Found - Unauthorized");
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    console.log("🟢 User Authenticated:", user.id);

    // Get Username from Clerk (e.g. "admin")
    const adminUsername = user.username;

    if (!adminUsername) {
      return NextResponse.json({
        success: false,
        message: "No username found on your account. Please set a username in Clerk."
      }, { status: 400 });
    }

    // 2. Find OR Create Admin in Database (Auto-Sync Logic) 🛠️
    let dbUser = await prisma.user.findUnique({
      where: { username: adminUsername }
    });

    // Agar user nahi mila, toh turant bana do!
    if (!dbUser) {
      console.log(`User '${adminUsername}' not found in DB. Creating now...`);

      try {
        dbUser = await prisma.user.create({
          data: {
            username: adminUsername,
            // Dummy data kyunki DB mein ye fields required hain
            name: "Admin User",
            email: `${adminUsername}@system.local`, // Fake email taaki unique constraint pass ho jaye
            role: Role.ADMIN,
            userCode: `ADM-${Math.floor(Math.random() * 1000)}`,
          }
        });
      } catch (e) {
        console.error("Failed to auto-create admin:", e);
        return NextResponse.json({ success: false, message: "Database Sync Failed." }, { status: 500 });
      }
    }

    let filename = "unknown_file.xlsx";

    try {
      // 3. Process Excel Data
      const body = await req.json();
      const { players, fileName: fName } = body;

      if (fName) filename = fName;

      if (!players || !Array.isArray(players) || players.length === 0) {
        return NextResponse.json({ success: false, message: "File is empty or invalid." }, { status: 400 });
      }

      // 4. Team Code Logic
      const teamCodesInSheet = Array.from(new Set(players.map((p: any) => p.teamCode).filter(Boolean)));

      const teams = await prisma.team.findMany({
        where: { code: { in: teamCodesInSheet as string[] } },
        select: { id: true, code: true }
      });

      const teamMap = new Map(teams.map(t => [t.code, t.id]));

      // 5. Bulk Create Players (Clerk + DB)
      console.log("🟢 Initializing Clerk Client...");
      const client = await clerkClient();
      console.log("🟢 Clerk Client Ready. Processing players...");

      const results = [];
      const errors = [];

      for (const p of players) {
        let clerkUser: any = null;
        let finalUsername = "";
        let finalUserCode = "";

        try {
          const email = p.email;
          if (!email) throw new Error(`Email is required for player ${p.name}`);

          let genderEnum: Gender = "M";
          const g = p.gender?.toString().toUpperCase();
          if (g === "F" || g === "FEMALE") genderEnum = "F";
          else if (g === "OTHER") genderEnum = "OTHER";

          const dobDate = new Date(p.dob);
          const validDob = isNaN(dobDate.getTime()) ? new Date() : dobDate;
          const teamId = p.teamCode ? teamMap.get(p.teamCode) : null;

          // 1. Check if user already exists in Clerk
          const existingUsers = await client.users.getUserList({ emailAddress: [email] });

          if (existingUsers.data.length > 0) {
            // User exists! Use this user.
            clerkUser = existingUsers.data[0];
            console.log(`⚠️ User already exists in Clerk: ${clerkUser.id}`);

            // 🔥 CRITICAL FIX: Trust existing username. 
            // If they have a username, use it for DB code too (if compatible) or keep existing code.
            // But for this import logic, let's assume valid usernames are the codes.
            finalUsername = clerkUser.username || `player_${Date.now()}`;
            finalUserCode = finalUsername; // Ideally, username IS the code.

          } else {
            // User does not exist, Create new.
            // 🔥 CRITICAL FIX: Generate ONCE, use EVERYWHERE.
            const uniqueRandom = `PL-${Math.floor(100000 + Math.random() * 900000)}`;
            finalUsername = uniqueRandom;
            finalUserCode = uniqueRandom;

            try {
              console.log(`🟢 Creating Clerk User: ${email}`);
              clerkUser = await client.users.createUser({
                emailAddress: [email],
                password: "dcPl@yer00",
                firstName: p.name?.split(" ")[0] || "Player",
                lastName: p.name?.split(" ").slice(1).join(" ") || "",
                username: finalUsername, // Use strict PL-XXXXXX
                publicMetadata: { role: "player" }
              });
              console.log(`✅ Clerk User Created: ${clerkUser.id}`);
            } catch (clerkError: any) {
              console.error(`❌ Clerk Creation Failed for ${email}:`, clerkError);
              throw new Error(`Clerk Error: ${clerkError.errors?.[0]?.message || clerkError.message}`);
            }
          }

          // 2. Upsert User in Database
          // We use upsert to ensure we don't fail if the user exists in DB but not linked correctly.
          // 2. Upsert User in Database
          const newItem = await prisma.user.upsert({
            where: { id: clerkUser.id },
            update: {
              name: p.name || undefined,
              phone: p.phone ? String(p.phone) : undefined,
              // Change: Now we sync the username and userCode from Clerk to our DB
              username: finalUsername,
              userCode: finalUserCode,
            },
            create: {
              id: clerkUser.id,
              username: finalUsername, // PL-XXXXXX
              userCode: finalUserCode, // PL-XXXXXX

              name: p.name || "Unknown Player",
              email: email,
              phone: p.phone ? String(p.phone) : null,
              role: Role.PLAYER,
              forcePasswordReset: true,
            }
          });

          // 3. Upsert PlayerProfile
          // If profile exists, update it.
          await prisma.playerProfile.upsert({
            where: { userId: clerkUser.id },
            update: {
              dob: validDob,
              gender: genderEnum,
              jerseyNumber: p.jerseyNumber ? Number(p.jerseyNumber) : undefined,
              address: p.address || undefined,
              teamId: teamId || undefined
            },
            create: {
              userId: clerkUser.id,
              dob: validDob,
              gender: genderEnum,
              jerseyNumber: p.jerseyNumber ? Number(p.jerseyNumber) : null,
              address: p.address || null,
              teamId: teamId
            }
          });

          results.push(newItem);

        } catch (err: any) {
          console.error(`❌ Failed to import player ${p.name}:`, err);
          errors.push({ name: p.name, error: err.message || "Unknown error" });

          // NOTE: We do NOT rollback (delete) the Clerk user if we simply failed to sync to DB 
          // because if it was an *existing* user, we shouldn't delete them.
          // Only if we *just* created them and failed immediately could we consider rollback, 
          // but checking if they existed before is complex here without more state. 
          // Safer to just log error and let admin handle manual cleanup if needed.
        }
      }

      // 6. Log Import Result
      const status = errors.length === 0 ? "SUCCESS" : (results.length > 0 ? "PARTIAL_SUCCESS" : "FAILED");

      if (dbUser) {
        await prisma.importLog.create({
          data: {
            action: "Import Players",
            filename: filename,
            status: status,
            rowCount: results.length,
            errorMsg: errors.length > 0 ? JSON.stringify(errors) : null,
            userId: dbUser.id
          }
        });
      }

      return NextResponse.json({
        success: true,
        message: `Imported ${results.length} players. Failed: ${errors.length}`,
        errors: errors
      });

    } catch (error: any) {
      console.error("❌ CRTICAL: Global Import Error:", error);
      return NextResponse.json({ success: false, message: "Server Error: " + error.message }, { status: 500 });
    }
  } catch (error: any) {
    console.error("❌ CRTICAL: Server Crash Prevention:", error);
    return NextResponse.json({ success: false, message: "Critical Server Error" }, { status: 500 });
  }
}