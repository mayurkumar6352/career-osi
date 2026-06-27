import { z } from "zod";

export const NetworkingContactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  title: z.string().optional(),
  company: z.string().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  type: z.enum(["CONNECTION","ALUMNI","MENTOR","REFERRAL","COLLEAGUE","FRIEND"]).default("CONNECTION"),
  relationshipHealth: z.enum(["HOT","WARM","COLD","INACTIVE"]).default("WARM"),
  lastContactDate: z.coerce.date().optional().nullable(),
  notes: z.string().optional(),
  tags: z.array(z.string()).default([]),
  source: z.string().optional(),
});

export type NetworkingContactInput = z.infer<typeof NetworkingContactSchema>;
