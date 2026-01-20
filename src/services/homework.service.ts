import prisma from "@/lib/prisma";
import { sendNotification } from "@/lib/automation";

interface AssignHomeworkInput {
  playerId: string;
  coachId: string;
  template: string;
  skillFocus: string;
  currentRating: number;
  goalRating: number;
  drillItems: any[];
  estimatedTimeMin: number;
}

export async function assignHomeworkService(data: AssignHomeworkInput) {
  const assignment = await prisma.assignment.create({
    data: {
      playerId: data.playerId,
      coachId: data.coachId,
      template: data.template,
      skillFocus: data.skillFocus,
      currentRating: data.currentRating,
      goalRating: data.goalRating,
      drillItems: data.drillItems,
      estimatedTimeMin: data.estimatedTimeMin,
      status: "SENT",
      exportFormats: [],
    },
    include: {
      player: { include: { user: true } },
      coach: { include: { user: true } },
    },
  });

  await sendNotification("HOMEWORK_ASSIGNED", {
    entity: "HOMEWORK",
    action: "ASSIGNED",
    body: {
      playerName: assignment.player.user.name,
      playerEmail: assignment.player.user.email,
      coachName: assignment.coach.user.name,
      focus: assignment.skillFocus,
      currentRating: assignment.currentRating,
      goalRating: assignment.goalRating,
      timeMinutes: assignment.estimatedTimeMin,
      drills: assignment.drillItems,
    },
  });

  return assignment;
}
