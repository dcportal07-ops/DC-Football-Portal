import prisma from "@/lib/prisma";
import { sendNotification } from "@/lib/automation";
import bcrypt from "bcryptjs";
// import { Role } from "@/generated/prisma/enums";
import { Role } from '@prisma/client'

interface CreateCoachInput {
  name: string;
  email: string;
}

export const createCoachService = async (data: CreateCoachInput) => {
  // 1️⃣ Generate username + password
  const userCode = `coach_${Math.floor(10000 + Math.random() * 90000)}`;
  const tempPassword = `Coach@${Math.floor(1000 + Math.random() * 9000)}`;
  const hashedPassword = await bcrypt.hash(tempPassword, 10);

  // 2️⃣ Create USER
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      username: userCode,
      userCode,
      role: Role.COACH,
    },
  });

  // 3️⃣ Create COACH PROFILE
  const coachProfile = await prisma.coachProfile.create({
    data: {
      userId: user.id,
    },
  });

  // 4️⃣ Trigger n8n
  await sendNotification("COACH_CREATED", {
    entity: "COACH",
    action: "CREATED",
    body: {
      name: user.name,
      email: user.email,
      username: user.userCode, // ✅ FIX
      tempPassword,
    },
  });

  return {
    user,
    coachProfile,
  };
};

