import { NextResponse } from "next/server";
import { submitEvaluationService } from "@/services/evaluation.service";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const result = await submitEvaluationService(body);

    return NextResponse.json({ success: true, data: result });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { success: false, message: "Evaluation failed" },
      { status: 500 }
    );
  }
}
