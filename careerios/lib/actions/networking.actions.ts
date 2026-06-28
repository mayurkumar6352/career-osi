"use server";
import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase-server";
import { NetworkingRepository } from "@/lib/repositories/networking.repository";
import { NetworkingContactSchema } from "@/lib/validators/networking";
import type { ActionResult, NetworkingContact } from "@/types";

async function getUserId() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return user.id;
}

export async function createNetworkingContact(data: unknown): Promise<ActionResult<NetworkingContact>> {
  try {
    const userId = await getUserId();
    const validated = NetworkingContactSchema.parse(data);
    const contact = await NetworkingRepository.create(userId, validated);
    revalidatePath("/dashboard/networking");
    return { success: true, data: contact };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function updateNetworkingContact(id: string, data: unknown): Promise<ActionResult<NetworkingContact>> {
  try {
    const userId = await getUserId();
    const validated = NetworkingContactSchema.partial().parse(data);
    const contact = await NetworkingRepository.update(id, userId, validated);
    revalidatePath("/dashboard/networking");
    return { success: true, data: contact };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function deleteNetworkingContact(id: string): Promise<ActionResult> {
  try {
    const userId = await getUserId();
    await NetworkingRepository.delete(id, userId);
    revalidatePath("/dashboard/networking");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
