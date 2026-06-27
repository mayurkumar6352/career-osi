import { z } from "zod";

export const RecruiterSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  title: z.string().optional(),
  company: z.string().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  type: z.enum(["RECRUITER","HIRING_MANAGER","FOUNDER","HR","REFERRAL","HEADHUNTER"]).default("RECRUITER"),
  relationshipScore: z.coerce.number().min(0).max(100).default(50),
  lastContactDate: z.coerce.date().optional().nullable(),
  notes: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

export type RecruiterInput = z.infer<typeof RecruiterSchema>;
