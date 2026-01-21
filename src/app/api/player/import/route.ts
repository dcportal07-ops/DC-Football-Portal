import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
// import { Gender,Role } from "@/generated/prisma/enums";
import {Gender, Role } from '@prisma/client'
import { currentUser } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  // 1. Auth Check (Clerk)
  const user = await currentUser();
  
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

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

    // 5. Bulk Create Players
    await prisma.$transaction(
      players.map((p: any) => {
        const userCode = `PL-${Math.floor(100000 + Math.random() * 900000)}`;
        
        let genderEnum: Gender = "M";
        const g = p.gender?.toString().toUpperCase();
        if (g === "F" || g === "FEMALE") genderEnum = "F";
        else if (g === "OTHER") genderEnum = "OTHER";

        const dobDate = new Date(p.dob); 
        const validDob = isNaN(dobDate.getTime()) ? new Date() : dobDate;

        const teamId = p.teamCode ? teamMap.get(p.teamCode) : null;

        return prisma.user.create({
          data: {
            userCode: userCode,
            username: `player_${Math.floor(Math.random() * 1000000)}`, // Unique username for player
            name: p.name || "Unknown Player",
            email: p.email, 
            phone: p.phone ? String(p.phone) : null,
            role: Role.PLAYER,
            playerProfile: {
              create: {
                dob: validDob,
                gender: genderEnum,
                jerseyNumber: p.jerseyNumber ? Number(p.jerseyNumber) : null,
                address: p.address || null,
                team: teamId ? { connect: { id: teamId } } : undefined
              }
            }
          }
        });
      })
    );

    // 6. Log Success
    if (dbUser) {
        await prisma.importLog.create({
            data: {
                action: "Import Players",
                filename: filename,
                status: "SUCCESS",
                rowCount: players.length,
                userId: dbUser.id
            }
        });
    }

    return NextResponse.json({ success: true, message: `Imported ${players.length} players!` });

  } catch (error: any) {
    console.error("Import Error:", error);

    if (dbUser?.id) {
        await prisma.importLog.create({
        data: {
            action: "Import Players",
            filename: filename,
            status: "FAILED",
            rowCount: 0,
            errorMsg: error.message || "Unknown Error",
            userId: dbUser.id
        }
        });
    }

    if (error.code === 'P2002') {
      return NextResponse.json({ success: false, message: "Import Failed: Duplicate data found (Email/Username)." }, { status: 409 });
    }
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}