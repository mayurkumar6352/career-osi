import { z } from "zod";

export const ApplicationSchema = z.object({
  company: z.string().min(1, "Company name is required"),
  jobTitle: z.string().min(1, "Job title is required"),
  jobUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  status: z.enum(["SAVED","APPLIED","ASSESSMENT","RECRUITER_SCREEN","INTERVIEW_R1","INTERVIEW_R2","FINAL_INTERVIEW","OFFER","NEGOTIATION","ACCEPTED","REJECTED","GHOSTED","ARCHIVED"]).default("SAVED"),
  priority: z.enum(["LOW","MEDIUM","HIGH","URGENT"]).default("MEDIUM"),
  location: z.string().optional(),
  locationType: z.enum(["REMOTE","HYBRID","ONSITE"]).optional().nullable(),
  salaryMin: z.coerce.number().min(0).optional().nullable(),
  salaryMax: z.coerce.number().min(0).optional().nullable(),
  salaryCurrency: z.string().default("USD"),
  employmentType: z.enum(["FULL_TIME","PART_TIME","CONTRACT","INTERNSHIP","FREELANCE"]).optional().nullable(),
  jobDescription: z.string().optional(),
  requirements: z.string().optional(),
  benefits: z.string().optional(),
  companyWebsite: z.string().url().optional().or(z.literal("")),
  companySize: z.string().optional(),
  industry: z.string().optional(),
  source: z.string().optional(),
  appliedDate: z.coerce.date().optional().nullable(),
  deadlineDate: z.coerce.date().optional().nullable(),
  tags: z.array(z.string()).default([]),
  skills: z.array(z.string()).default([]),
  coverLetter: z.string().optional(),
  resumeVersion: z.string().optional(),
  referralName: z.string().optional(),
  recruiterName: z.string().optional(),
  notes: z.string().optional(),
});

export type ApplicationInput = z.infer<typeof ApplicationSchema>;

export const ImportJobSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
});

export type ImportJobInput = z.infer<typeof ImportJobSchema>;
