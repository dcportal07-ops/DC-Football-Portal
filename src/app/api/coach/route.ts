import { NextResponse } from "next/server";
import { createCoachService } from "@/services/coach.service";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 🔒 Basic validation
    if (!body.name || !body.email) {
      return NextResponse.json(
        { success: false, message: "Name and Email are required" },
        { status: 400 }
      );
    }

    const result = await createCoachService({
      name: body.name,
      email: body.email,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("Coach API Error:", error);

    // Duplicate email / userCode handling
    if (error.code === "P2002") {
      return NextResponse.json(
        { success: false, message: "Coach with this email already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Coach creation failed" },
      { status: 500 }
    );
  }
}
