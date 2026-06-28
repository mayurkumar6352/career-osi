"use server";
import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase-server";
import { TaskRepository } from "@/lib/repositories/task.repository";
import { TaskSchema } from "@/lib/validators/task";
import type { ActionResult, Task } from "@/types";

async function getUserId() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return user.id;
}

export async function createTask(data: unknown): Promise<ActionResult<Task>> {
  try {
    const userId = await getUserId();
    const validated = TaskSchema.parse(data);
    const task = await TaskRepository.create(userId, validated);
    revalidatePath("/dashboard/tasks");
    return { success: true, data: task };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function updateTask(id: string, data: unknown): Promise<ActionResult<Task>> {
  try {
    const userId = await getUserId();
    const validated = TaskSchema.partial().parse(data);
    const task = await TaskRepository.update(id, userId, validated);
    revalidatePath("/dashboard/tasks");
    return { success: true, data: task };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function completeTask(id: string): Promise<ActionResult<Task>> {
  try {
    const userId = await getUserId();
    const task = await TaskRepository.complete(id, userId);
    revalidatePath("/dashboard/tasks");
    revalidatePath("/dashboard");
    return { success: true, data: task };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function deleteTask(id: string): Promise<ActionResult> {
  try {
    const userId = await getUserId();
    await TaskRepository.delete(id, userId);
    revalidatePath("/dashboard/tasks");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
