import { z } from "zod";

export const TaskSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  description: z.string().optional(),
  status: z.enum(["TODO","IN_PROGRESS","DONE","CANCELLED"]).default("TODO"),
  priority: z.enum(["LOW","MEDIUM","HIGH","URGENT"]).default("MEDIUM"),
  category: z.enum(["FOLLOW_UP","INTERVIEW_PREP","NETWORKING","RESEARCH","APPLICATION","GENERAL"]).default("GENERAL"),
  dueDate: z.coerce.date().optional().nullable(),
  applicationId: z.string().optional().nullable(),
  interviewId: z.string().optional().nullable(),
  recruiterId: z.string().optional().nullable(),
  contactId: z.string().optional().nullable(),
});

export type TaskInput = z.infer<typeof TaskSchema>;
