import { NextResponse } from "next/server";
import { createPlayerService } from "@/services/player.service";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const result = await createPlayerService(body);

    return NextResponse.json({ success: true, data: result });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { success: false, message: "Player creation failed" },
      { status: 500 }
    );
  }
}
