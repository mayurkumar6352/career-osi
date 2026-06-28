"use server";
import { createServerSupabase } from "@/lib/supabase-server";
import type { ActionResult } from "@/types";
import OpenAI from "openai";

async function getUserId() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return user.id;
}

const getOpenAI = () => new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateInterviewQuestions(params: {
  company: string;
  jobTitle: string;
  type: string;
  jobDescription?: string;
}): Promise<ActionResult<{ technical: string[]; behavioral: string[]; hr: string[]; companySpecific: string[] }>> {
  try {
    await getUserId();
    const openai = getOpenAI();
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert interview coach. Return JSON with keys: technical (array), behavioral (array), hr (array), companySpecific (array). Each array has 5 questions.",
        },
        {
          role: "user",
          content: `Generate interview questions for: ${params.jobTitle} at ${params.company}. Interview type: ${params.type}. ${params.jobDescription ? `Job description: ${params.jobDescription}` : ""}`,
        },
      ],
      response_format: { type: "json_object" },
    });
    const data = JSON.parse(response.choices[0].message.content || "{}");
    return { success: true, data };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function generateFollowUpEmail(params: {
  type: "recruiter_followup" | "thank_you" | "referral_request" | "networking" | "interview_followup";
  recipientName: string;
  company: string;
  jobTitle?: string;
  context?: string;
  userName: string;
}): Promise<ActionResult<{ subject: string; body: string }>> {
  try {
    await getUserId();
    const openai = getOpenAI();

    const typeDescriptions: Record<string, string> = {
      recruiter_followup: "a follow-up email to a recruiter about my application status",
      thank_you: "a thank-you email after an interview",
      referral_request: "a request for a referral or introduction",
      networking: "a networking outreach message",
      interview_followup: "a follow-up email after an interview with next steps",
    };

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a professional career coach. Write concise, professional emails. Return JSON with keys: subject (string), body (string). Keep emails under 150 words, warm but professional tone.",
        },
        {
          role: "user",
          content: `Write ${typeDescriptions[params.type]} to ${params.recipientName} at ${params.company}${params.jobTitle ? ` for the ${params.jobTitle} position` : ""}. My name is ${params.userName}. ${params.context || ""}`,
        },
      ],
      response_format: { type: "json_object" },
    });
    const data = JSON.parse(response.choices[0].message.content || "{}");
    return { success: true, data };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function analyzeResumeMatch(params: {
  resumeText: string;
  jobDescription: string;
  jobTitle: string;
}): Promise<ActionResult<{
  matchScore: number;
  skillOverlap: string[];
  missingSkills: string[];
  atsScore: number;
  suggestions: string[];
  missingKeywords: string[];
}>> {
  try {
    await getUserId();
    const openai = getOpenAI();
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an ATS and resume expert. Analyze the resume against the job description and return JSON with: matchScore (0-100), skillOverlap (string array), missingSkills (string array), atsScore (0-100), suggestions (string array of 5 improvements), missingKeywords (string array).",
        },
        {
          role: "user",
          content: `Analyze this resume for the ${params.jobTitle} position.\n\nResume:\n${params.resumeText}\n\nJob Description:\n${params.jobDescription}`,
        },
      ],
      response_format: { type: "json_object" },
    });
    const data = JSON.parse(response.choices[0].message.content || "{}");
    return { success: true, data };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function generateSTARAnswer(params: {
  question: string;
  context: string;
}): Promise<ActionResult<{ situation: string; task: string; action: string; result: string; fullAnswer: string }>> {
  try {
    await getUserId();
    const openai = getOpenAI();
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an interview coach. Create a STAR method answer. Return JSON with: situation, task, action, result (each a string), and fullAnswer (combined paragraph).",
        },
        {
          role: "user",
          content: `Question: ${params.question}\nContext about me: ${params.context}`,
        },
      ],
      response_format: { type: "json_object" },
    });
    const data = JSON.parse(response.choices[0].message.content || "{}");
    return { success: true, data };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function optimizeResumeBullet(params: {
  bullet: string;
  jobTitle: string;
  targetRole: string;
}): Promise<ActionResult<{ original: string; optimized: string; explanation: string }>> {
  try {
    await getUserId();
    const openai = getOpenAI();
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a resume expert. Optimize resume bullet points. Return JSON with: original, optimized (with strong action verb, metrics, impact), explanation.",
        },
        {
          role: "user",
          content: `Optimize this bullet point for a ${params.targetRole} role. Current role: ${params.jobTitle}.\nBullet: ${params.bullet}`,
        },
      ],
      response_format: { type: "json_object" },
    });
    const data = JSON.parse(response.choices[0].message.content || "{}");
    return { success: true, data };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function getApplicationHealthScore(params: {
  company: string;
  jobTitle: string;
  daysSinceApplied: number;
  hasFollowedUp: boolean;
  hasRecruiterContact: boolean;
  interviewCount: number;
  hasNetworkConnection: boolean;
}): Promise<ActionResult<{
  overallScore: number;
  followUpScore: number;
  readinessScore: number;
  networkingScore: number;
  successProbability: number;
  recommendations: string[];
}>> {
  try {
    await getUserId();
    const openai = getOpenAI();
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a career coach. Score this job application and return JSON with: overallScore (0-100), followUpScore (0-100), readinessScore (0-100), networkingScore (0-100), successProbability (0-100), recommendations (array of 3 actionable steps).",
        },
        {
          role: "user",
          content: `Evaluate this application: ${params.jobTitle} at ${params.company}. Days since applied: ${params.daysSinceApplied}. Followed up: ${params.hasFollowedUp}. Recruiter contact: ${params.hasRecruiterContact}. Interviews: ${params.interviewCount}. Network connection: ${params.hasNetworkConnection}.`,
        },
      ],
      response_format: { type: "json_object" },
    });
    const data = JSON.parse(response.choices[0].message.content || "{}");
    return { success: true, data };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
