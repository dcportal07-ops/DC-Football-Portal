import { NextResponse } from "next/server";
import { assignHomeworkService } from "@/services/homework.service";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const result = await assignHomeworkService(body);

    return NextResponse.json({ success: true, data: result });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { success: false, message: "Homework assignment failed" },
      { status: 500 }
    );
  }
}
