import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    return NextResponse.json({ user: dbUser });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const { email: _e, id: _i, createdAt: _c, updatedAt: _u, ...updateData } = body;
    const dbUser = await prisma.user.upsert({
      where: { id: user.id },
      update: updateData,
      create: { id: user.id, email: user.email!, ...updateData },
    });
    return NextResponse.json({ user: dbUser });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
