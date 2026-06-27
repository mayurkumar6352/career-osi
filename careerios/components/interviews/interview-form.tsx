// @ts-nocheck
"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InterviewSchema, type InterviewInput } from "@/lib/validators/interview";
import { createInterview, updateInterview } from "@/lib/actions/interview.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import type { Interview } from "@prisma/client";

interface InterviewFormProps {
  interview?: Interview;
  applicationId?: string;
  applications?: { id: string; company: string; jobTitle: string }[];
  onSuccess?: (interview: Interview) => void;
  onCancel?: () => void;
}

export function InterviewForm({ interview, applicationId, applications = [], onSuccess, onCancel }: InterviewFormProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<InterviewInput>({
    resolver: zodResolver(InterviewSchema),
    defaultValues: {
      title: interview?.title || "",
      type: interview?.type || "PHONE_SCREEN",
      status: interview?.status || "SCHEDULED",
      applicationId: interview?.applicationId || applicationId || undefined,
      platform: interview?.platform || "",
      meetingUrl: interview?.meetingUrl || "",
      scheduledAt: interview?.scheduledAt || new Date(),
      duration: interview?.duration || 60,
      location: interview?.location || "",
      interviewers: interview?.interviewers || [],
      notes: interview?.notes || "",
      feedback: interview?.feedback || "",
      prepNotes: interview?.prepNotes || "",
    },
  });

  const onSubmit = async (data: InterviewInput) => {
    setLoading(true);
    try {
      const result = interview
        ? await updateInterview(interview.id, data)
        : await createInterview(data);

      if (result.success && result.data) {
        toast.success(interview ? "Interview updated" : "Interview scheduled");
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
          <FormField control={form.control} name="title" render={({ field }) => (
            <FormItem>
              <FormLabel>Interview Title *</FormLabel>
              <FormControl><Input placeholder="Technical Interview - Round 1" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="type" render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  {["PHONE_SCREEN","VIDEO_CALL","TECHNICAL","BEHAVIORAL","SYSTEM_DESIGN","TAKE_HOME","ONSITE","HR","FINAL","PANEL"].map((t) => (
                    <SelectItem key={t} value={t}>{t.replace(/_/g," ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        {applications.length > 0 && (
          <FormField control={form.control} name="applicationId" render={({ field }) => (
            <FormItem>
              <FormLabel>Linked Application</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                <FormControl><SelectTrigger><SelectValue placeholder="Link to an application" /></SelectTrigger></FormControl>
                <SelectContent>
                  {applications.map((app) => (
                    <SelectItem key={app.id} value={app.id}>{app.company} — {app.jobTitle}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="scheduledAt" render={({ field }) => (
            <FormItem>
              <FormLabel>Date & Time *</FormLabel>
              <FormControl>
                <Input
                  type="datetime-local"
                  {...field}
                  value={field.value instanceof Date ? field.value.toISOString().slice(0, 16) : String(field.value).slice(0, 16)}
                  onChange={(e) => field.onChange(new Date(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="duration" render={({ field }) => (
            <FormItem>
              <FormLabel>Duration (minutes)</FormLabel>
              <FormControl><Input type="number" min={5} max={480} {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="platform" render={({ field }) => (
            <FormItem>
              <FormLabel>Platform</FormLabel>
              <FormControl><Input placeholder="Zoom, Google Meet, Teams..." {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="meetingUrl" render={({ field }) => (
            <FormItem>
              <FormLabel>Meeting URL</FormLabel>
              <FormControl><Input placeholder="https://zoom.us/..." {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="prepNotes" render={({ field }) => (
          <FormItem>
            <FormLabel>Prep Notes</FormLabel>
            <FormControl><Textarea placeholder="What to prepare, research, practice..." rows={3} {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="notes" render={({ field }) => (
          <FormItem>
            <FormLabel>Notes</FormLabel>
            <FormControl><Textarea placeholder="Additional notes..." rows={2} {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="flex justify-end gap-3 pt-2">
          {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
          <Button type="submit" loading={loading}>
            {interview ? "Save Changes" : "Schedule Interview"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
