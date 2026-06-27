"use server";
import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase";
import { InterviewRepository } from "@/lib/repositories/interview.repository";
import { InterviewSchema } from "@/lib/validators/interview";
import type { ActionResult, Interview } from "@/types";

async function getUserId() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return user.id;
}

export async function createInterview(data: unknown): Promise<ActionResult<Interview>> {
  try {
    const userId = await getUserId();
    const validated = InterviewSchema.parse(data);
    const interview = await InterviewRepository.create(userId, validated);
    revalidatePath("/dashboard/interviews");
    revalidatePath("/dashboard");
    return { success: true, data: interview };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function updateInterview(id: string, data: unknown): Promise<ActionResult<Interview>> {
  try {
    const userId = await getUserId();
    const validated = InterviewSchema.partial().parse(data);
    const interview = await InterviewRepository.update(id, userId, validated);
    revalidatePath("/dashboard/interviews");
    revalidatePath(`/dashboard/interviews/${id}`);
    return { success: true, data: interview };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function deleteInterview(id: string): Promise<ActionResult> {
  try {
    const userId = await getUserId();
    await InterviewRepository.delete(id, userId);
    revalidatePath("/dashboard/interviews");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
