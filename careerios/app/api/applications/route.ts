import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";
import { ApplicationRepository } from "@/lib/repositories/application.repository";

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("limit") || "100");
    const search = searchParams.get("search") || undefined;
    const statusParam = searchParams.get("status");
    const status = statusParam ? (statusParam.split(",") as any[]) : undefined;
    const result = await ApplicationRepository.findAll(user.id, { search, status }, undefined, page, pageSize);
    return NextResponse.json({ applications: result.data, total: result.total, pages: result.totalPages });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
