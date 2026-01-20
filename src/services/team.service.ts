import prisma from "@/lib/prisma";
import { sendNotification } from "@/lib/automation";

interface CreateTeamInput {
  name: string;
  code: string;
  ageGroup: string;
}

export async function createTeamService(data: CreateTeamInput) {
  // 1️⃣ Create Team in DB
  const team = await prisma.team.create({
    data: {
      name: data.name,
      code: data.code,
      ageGroup: data.ageGroup,
    },
  });

  // 2️⃣ Trigger n8n automation
  await sendNotification("TEAM_CREATED", {
    entity: "TEAM",
    action: "CREATED",
    body: {
      id: team.id,
      name: team.name,
      code: team.code,
      ageGroup: team.ageGroup,
      createdAt: team.createdAt,
    },
  });

  return team;
}
