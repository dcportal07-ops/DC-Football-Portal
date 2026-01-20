"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ✅ Added teamId to types
export const createEvent = async (data: { title: string; start: Date; end: Date; teamId: string }) => {
  console.log("🔥 SERVER ACTION HIT");

  try {
    await prisma.event.create({
      data: {
        title: data.title,
        startTime: data.start,
        endTime: data.end,
        teamId: data.teamId, // ✅ Directly use selected Team ID
      },
    });
    revalidatePath("/list/events");
    revalidatePath("/coach"); // Refresh coach page too
    return { success: true };
  } catch (err) {
    console.log(err);
    return { success: false, error: "Failed to create event" };
  }
};

export const updateEvent = async (id: string, data: { title: string; start: Date; end: Date }) => {
  try {
    await prisma.event.update({
      where: { id },
      data: {
        title: data.title,
        startTime: data.start,
        endTime: data.end,
      },
    });
    revalidatePath("/list/events");
    revalidatePath("/coach");
    return { success: true };
  } catch (err) {
    return { success: false, error: "Failed to update" };
  }
};

export const deleteEvent = async (id: string) => {
  try {
    await prisma.event.delete({ where: { id } });
    revalidatePath("/list/events");
    revalidatePath("/coach");
    return { success: true };
  } catch (err) {
    return { success: false, error: "Failed to delete" };
  }
};