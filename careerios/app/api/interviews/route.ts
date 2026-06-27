import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";
import { InterviewRepository } from "@/lib/repositories/interview.repository";

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const interviews = await InterviewRepository.findAll(user.id);
    return NextResponse.json({ interviews });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
