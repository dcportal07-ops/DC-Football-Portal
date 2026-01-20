import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const logs = await prisma.importLog.findMany({
      orderBy: { createdAt: 'desc' }, // Latest pehle
      take: 50, // Sirf last 50 dikhao
      include: {
        user: {
          select: { name: true, photo: true, role: true } // User details bhi chahiye
        }
      }
    });

    return NextResponse.json(logs);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}