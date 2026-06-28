"use server";
import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase-server";
import { OfferRepository } from "@/lib/repositories/offer.repository";
import { OfferSchema } from "@/lib/validators/offer";
import type { ActionResult, Offer } from "@/types";

async function getUserId() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return user.id;
}

export async function createOffer(data: unknown): Promise<ActionResult<Offer>> {
  try {
    const userId = await getUserId();
    const validated = OfferSchema.parse(data);
    const offer = await OfferRepository.create(userId, validated);
    revalidatePath("/dashboard/offers");
    revalidatePath("/dashboard");
    return { success: true, data: offer };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function updateOffer(id: string, data: unknown): Promise<ActionResult<Offer>> {
  try {
    const userId = await getUserId();
    const validated = OfferSchema.partial().parse(data);
    const offer = await OfferRepository.update(id, userId, validated);
    revalidatePath("/dashboard/offers");
    return { success: true, data: offer };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function deleteOffer(id: string): Promise<ActionResult> {
  try {
    const userId = await getUserId();
    await OfferRepository.delete(id, userId);
    revalidatePath("/dashboard/offers");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
