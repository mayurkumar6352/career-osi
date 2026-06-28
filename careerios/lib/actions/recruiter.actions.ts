"use server";
import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase-server";
import { RecruiterRepository } from "@/lib/repositories/recruiter.repository";
import { RecruiterSchema } from "@/lib/validators/recruiter";
import type { ActionResult, Recruiter } from "@/types";

async function getUserId() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return user.id;
}

export async function createRecruiter(data: unknown): Promise<ActionResult<Recruiter>> {
  try {
    const userId = await getUserId();
    const validated = RecruiterSchema.parse(data);
    const recruiter = await RecruiterRepository.create(userId, validated);
    revalidatePath("/dashboard/recruiters");
    return { success: true, data: recruiter };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function updateRecruiter(id: string, data: unknown): Promise<ActionResult<Recruiter>> {
  try {
    const userId = await getUserId();
    const validated = RecruiterSchema.partial().parse(data);
    const recruiter = await RecruiterRepository.update(id, userId, validated);
    revalidatePath("/dashboard/recruiters");
    return { success: true, data: recruiter };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function deleteRecruiter(id: string): Promise<ActionResult> {
  try {
    const userId = await getUserId();
    await RecruiterRepository.delete(id, userId);
    revalidatePath("/dashboard/recruiters");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
