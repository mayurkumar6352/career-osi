import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { RecruiterRepository } from "@/lib/repositories/recruiter.repository";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const search = new URL(req.url).searchParams.get("search") || undefined;
    const recruiters = await RecruiterRepository.findAll(user.id, search);
    return NextResponse.json({ recruiters });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
