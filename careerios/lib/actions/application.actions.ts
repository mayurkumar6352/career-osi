"use server";
import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase";
import { ApplicationRepository } from "@/lib/repositories/application.repository";
import { ApplicationSchema, ImportJobSchema } from "@/lib/validators/application";
import type { ActionResult, Application, ApplicationStatus } from "@/types";

async function getUserId(): Promise<string> {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return user.id;
}

export async function createApplication(formData: unknown): Promise<ActionResult<Application>> {
  try {
    const userId = await getUserId();
    const validated = ApplicationSchema.parse(formData);
    const app = await ApplicationRepository.create(userId, validated);
    revalidatePath("/dashboard/applications");
    revalidatePath("/dashboard");
    return { success: true, data: app };
  } catch (e: any) {
    return { success: false, error: e.message || "Failed to create application" };
  }
}

export async function updateApplication(id: string, formData: unknown): Promise<ActionResult<Application>> {
  try {
    const userId = await getUserId();
    const validated = ApplicationSchema.partial().parse(formData);
    const app = await ApplicationRepository.update(id, userId, validated);
    revalidatePath("/dashboard/applications");
    revalidatePath(`/dashboard/applications/${id}`);
    return { success: true, data: app };
  } catch (e: any) {
    return { success: false, error: e.message || "Failed to update application" };
  }
}

export async function updateApplicationStatus(id: string, status: ApplicationStatus, note?: string): Promise<ActionResult<Application>> {
  try {
    const userId = await getUserId();
    const app = await ApplicationRepository.updateStatus(id, userId, status, note);
    revalidatePath("/dashboard/applications");
    revalidatePath(`/dashboard/applications/${id}`);
    revalidatePath("/dashboard");
    return { success: true, data: app };
  } catch (e: any) {
    return { success: false, error: e.message || "Failed to update status" };
  }
}

export async function deleteApplication(id: string): Promise<ActionResult> {
  try {
    const userId = await getUserId();
    await ApplicationRepository.delete(id, userId);
    revalidatePath("/dashboard/applications");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message || "Failed to delete application" };
  }
}

export async function importJobFromUrl(formData: unknown): Promise<ActionResult<Application>> {
  try {
    const userId = await getUserId();
    const { url } = ImportJobSchema.parse(formData);
    const OpenAI = (await import("openai")).default;
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: `Extract job details from the given URL and return JSON with: company, jobTitle, location, locationType (REMOTE/HYBRID/ONSITE), salaryMin, salaryMax, employmentType (FULL_TIME/PART_TIME/CONTRACT/INTERNSHIP/FREELANCE), jobDescription, requirements, benefits, companyWebsite, industry, skills (array). If you cannot determine a value, use null.` },
        { role: "user", content: `Extract job details from this URL: ${url}` },
      ],
      response_format: { type: "json_object" },
    });
    const extracted = JSON.parse(response.choices[0].message.content || "{}");
    const appData = ApplicationSchema.parse({
      ...extracted,
      jobUrl: url,
      source: url.includes("linkedin") ? "LinkedIn" : url.includes("indeed") ? "Indeed" : "Company Website",
      status: "SAVED",
    });
    const app = await ApplicationRepository.create(userId, appData);
    revalidatePath("/dashboard/applications");
    return { success: true, data: app };
  } catch (e: any) {
    return { success: false, error: e.message || "Failed to import job" };
  }
}
