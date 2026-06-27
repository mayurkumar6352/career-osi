import { z } from "zod";

export const InterviewSchema = z.object({
  title: z.string().min(1, "Interview title is required"),
  type: z.enum(["PHONE_SCREEN","VIDEO_CALL","TECHNICAL","BEHAVIORAL","SYSTEM_DESIGN","TAKE_HOME","ONSITE","HR","FINAL","PANEL"]).default("PHONE_SCREEN"),
  status: z.enum(["SCHEDULED","COMPLETED","CANCELLED","RESCHEDULED","NO_SHOW"]).default("SCHEDULED"),
  applicationId: z.string().optional().nullable(),
  platform: z.string().optional(),
  meetingUrl: z.string().url().optional().or(z.literal("")),
  scheduledAt: z.coerce.date({ message: "Schedule date/time is required" }),
  duration: z.coerce.number().min(5).max(480).default(60),
  location: z.string().optional(),
  interviewers: z.array(z.string()).default([]),
  notes: z.string().optional(),
  feedback: z.string().optional(),
  rating: z.coerce.number().min(1).max(5).optional().nullable(),
  questionsAsked: z.array(z.string()).default([]),
  myAnswers: z.string().optional(),
  nextSteps: z.string().optional(),
  prepNotes: z.string().optional(),
});

export type InterviewInput = z.infer<typeof InterviewSchema>;
