import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";
import { NetworkingRepository } from "@/lib/repositories/networking.repository";

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const search = new URL(req.url).searchParams.get("search") || undefined;
    const contacts = await NetworkingRepository.findAll(user.id, search);
    return NextResponse.json({ contacts });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
