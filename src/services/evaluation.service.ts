import prisma from "@/lib/prisma";
import { sendNotification } from "@/lib/automation";

export async function submitEvaluationService(data: any) {
  const evaluation = await prisma.evaluation.create({
    data,
    include: {
      player: { include: { user: true } },
      coach: { include: { user: true } },
    },
  });

  await sendNotification("EVALUATION_SUBMITTED", {
    entity: "EVALUATION",
    action: "SUBMITTED",
    body: {
      playerName: evaluation.player.user.name,
      playerEmail: evaluation.player.user.email,
      coachName: evaluation.coach.user.name,
      scores: {
        technical: evaluation.technical,
        tactical: evaluation.tactical,
        physical: evaluation.physical,
        mental: evaluation.mental,
        attacking: evaluation.attacking,
        defending: evaluation.defending,
      },
      coachNote: evaluation.note,
    },
  });

  return evaluation;
}
