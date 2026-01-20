import prisma from "@/lib/prisma";
import { sendNotification } from "@/lib/automation";
import { Role, Gender } from "@/generated/prisma/enums";

interface CreatePlayerInput {
  name: string;
  email: string;
  parentEmail?: string;
  dob: string;
  gender: Gender;
  teamId?: string;
}

export async function createPlayerService(data: CreatePlayerInput) {
  const userCode = `player_${Math.floor(10000 + Math.random() * 90000)}`;

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      username: userCode,
      userCode,
      role: Role.PLAYER,
    },
  });

  const profile = await prisma.playerProfile.create({
    data: {
      userId: user.id,
      dob: new Date(data.dob),
      gender: data.gender,
      parentEmail: data.parentEmail,
      teamId: data.teamId,
    },
  });

  await sendNotification("PLAYER_CREATED", {
    entity: "PLAYER",
    action: "CREATED",
    body: {
      name: user.name,
      email: user.email,
      parentEmail: profile.parentEmail,
      username: user.userCode,
    },
  });

  return { user, profile };
}


