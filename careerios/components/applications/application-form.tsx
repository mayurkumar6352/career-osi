// @ts-nocheck
"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApplicationSchema, type ApplicationInput } from "@/lib/validators/application";
import { createApplication, updateApplication } from "@/lib/actions/application.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import type { Application } from "@prisma/client";
import { INDUSTRIES, SOURCES } from "@/lib/utils";

interface ApplicationFormProps {
  application?: Application;
  onSuccess?: (app: Application) => void;
  onCancel?: () => void;
}

export function ApplicationForm({ application, onSuccess, onCancel }: ApplicationFormProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<ApplicationInput>({
    resolver: zodResolver(ApplicationSchema),
    defaultValues: {
      company: application?.company || "",
      jobTitle: application?.jobTitle || "",
      jobUrl: application?.jobUrl || "",
      status: application?.status || "SAVED",
      priority: application?.priority || "MEDIUM",
      location: application?.location || "",
      locationType: application?.locationType || undefined,
      salaryMin: application?.salaryMin || undefined,
      salaryMax: application?.salaryMax || undefined,
      salaryCurrency: application?.salaryCurrency || "USD",
      employmentType: application?.employmentType || undefined,
      industry: application?.industry || "",
      source: application?.source || "",
      jobDescription: application?.jobDescription || "",
      requirements: application?.requirements || "",
      benefits: application?.benefits || "",
      companyWebsite: application?.companyWebsite || "",
      tags: application?.tags || [],
      skills: application?.skills || [],
      coverLetter: application?.coverLetter || "",
      resumeVersion: application?.resumeVersion || "",
      notes: application?.notes || "",
    },
  });

  const onSubmit = async (data: ApplicationInput) => {
    setLoading(true);
    try {
      const result = application
        ? await updateApplication(application.id, data)
        : await createApplication(data);

      if (result.success && result.data) {
        toast.success(application ? "Application updated" : "Application created");
        onSuccess?.(result.data);
      } else {
        toast.error(result.error || "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="company" render={({ field }) => (
            <FormItem>
              <FormLabel>Company *</FormLabel>
              <FormControl><Input placeholder="Google, Stripe, Notion..." {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="jobTitle" render={({ field }) => (
            <FormItem>
              <FormLabel>Job Title *</FormLabel>
              <FormControl><Input placeholder="Software Engineer, PM..." {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="status" render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  {["SAVED","APPLIED","ASSESSMENT","RECRUITER_SCREEN","INTERVIEW_R1","INTERVIEW_R2","FINAL_INTERVIEW","OFFER","NEGOTIATION","ACCEPTED","REJECTED","GHOSTED","ARCHIVED"].map((s) => (
                    <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="priority" render={({ field }) => (
            <FormItem>
              <FormLabel>Priority</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  {["LOW","MEDIUM","HIGH","URGENT"].map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="location" render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl><Input placeholder="New York, NY or Remote" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="locationType" render={({ field }) => (
            <FormItem>
              <FormLabel>Work Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="REMOTE">Remote</SelectItem>
                  <SelectItem value="HYBRID">Hybrid</SelectItem>
                  <SelectItem value="ONSITE">On-site</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField control={form.control} name="salaryMin" render={({ field }) => (
            <FormItem>
              <FormLabel>Salary Min</FormLabel>
              <FormControl><Input type="number" placeholder="80000" {...field} value={field.value ?? ""} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="salaryMax" render={({ field }) => (
            <FormItem>
              <FormLabel>Salary Max</FormLabel>
              <FormControl><Input type="number" placeholder="120000" {...field} value={field.value ?? ""} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="salaryCurrency" render={({ field }) => (
            <FormItem>
              <FormLabel>Currency</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  {["USD","EUR","GBP","CAD","AUD","INR"].map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="industry" render={({ field }) => (
            <FormItem>
              <FormLabel>Industry</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger></FormControl>
                <SelectContent>
                  {INDUSTRIES.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="source" render={({ field }) => (
            <FormItem>
              <FormLabel>Source</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                <FormControl><SelectTrigger><SelectValue placeholder="Where did you find it?" /></SelectTrigger></FormControl>
                <SelectContent>
                  {SOURCES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="jobUrl" render={({ field }) => (
          <FormItem>
            <FormLabel>Job URL</FormLabel>
            <FormControl><Input placeholder="https://..." {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="jobDescription" render={({ field }) => (
          <FormItem>
            <FormLabel>Job Description</FormLabel>
            <FormControl><Textarea placeholder="Paste the job description here..." rows={4} {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="notes" render={({ field }) => (
          <FormItem>
            <FormLabel>Notes</FormLabel>
            <FormControl><Textarea placeholder="Your notes about this opportunity..." rows={3} {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="flex justify-end gap-3 pt-2">
          {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
          <Button type="submit" loading={loading}>
            {application ? "Save Changes" : "Create Application"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
