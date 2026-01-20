import { NextResponse } from "next/server";
import { createTeamService } from "@/services/team.service";


export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Use the service! It handles DB creation AND Automation automatically.
    const team = await createTeamService({
        name: data.name,
        code: data.code,
        ageGroup: data.ageGroup
    });

    return NextResponse.json({ success: true, data: team });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}