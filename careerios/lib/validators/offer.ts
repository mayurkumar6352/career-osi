import { z } from "zod";

export const OfferSchema = z.object({
  company: z.string().min(1, "Company name is required"),
  jobTitle: z.string().min(1, "Job title is required"),
  applicationId: z.string().optional().nullable(),
  status: z.enum(["PENDING","ACCEPTED","DECLINED","NEGOTIATING","EXPIRED","RESCINDED"]).default("PENDING"),
  baseSalary: z.coerce.number().min(0, "Salary must be positive"),
  currency: z.string().default("USD"),
  bonus: z.coerce.number().min(0).optional().nullable(),
  bonusType: z.string().optional(),
  equity: z.coerce.number().min(0).optional().nullable(),
  equityType: z.string().optional(),
  equityVestingYears: z.coerce.number().min(0).optional().nullable(),
  stockOptions: z.coerce.number().min(0).optional().nullable(),
  signingBonus: z.coerce.number().min(0).optional().nullable(),
  benefits: z.array(z.string()).default([]),
  remotePolicty: z.string().optional(),
  workLocation: z.string().optional(),
  startDate: z.coerce.date().optional().nullable(),
  expiryDate: z.coerce.date().optional().nullable(),
  ptodays: z.coerce.number().min(0).optional().nullable(),
  healthInsurance: z.boolean().optional(),
  dentalVision: z.boolean().optional(),
  retirement401k: z.boolean().optional(),
  notes: z.string().optional(),
});

export type OfferInput = z.infer<typeof OfferSchema>;
