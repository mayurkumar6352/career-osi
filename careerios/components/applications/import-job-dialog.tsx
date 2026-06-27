"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImportJobSchema, type ImportJobInput } from "@/lib/validators/application";
import { importJobFromUrl } from "@/lib/actions/application.actions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Sparkles, Link, CheckCircle } from "lucide-react";
import type { Application } from "@/types";

interface ImportJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (app: Application) => void;
}

export function ImportJobDialog({ open, onOpenChange, onSuccess }: ImportJobDialogProps) {
  const [loading, setLoading] = useState(false);
  const [imported, setImported] = useState(false);

  const form = useForm<ImportJobInput>({
    resolver: zodResolver(ImportJobSchema),
    defaultValues: { url: "" },
  });

  const onSubmit = async (data: ImportJobInput) => {
    setLoading(true);
    try {
      const result = await importJobFromUrl(data);
      if (result.success && result.data) {
        setImported(true);
        toast.success("Job imported successfully!");
        setTimeout(() => {
          onSuccess?.(result.data!);
          onOpenChange(false);
          setImported(false);
          form.reset();
        }, 1000);
      } else {
        toast.error(result.error || "Failed to import job");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Job Import
          </DialogTitle>
          <DialogDescription>
            Paste a LinkedIn, Indeed, or company careers URL and AI will extract the job details automatically.
          </DialogDescription>
        </DialogHeader>

        {imported ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <CheckCircle className="h-8 w-8 text-emerald-500" />
            </div>
            <p className="font-semibold text-emerald-600 dark:text-emerald-400">Job imported!</p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="url" render={({ field }) => (
                <FormItem>
                  <FormLabel>Job URL</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Link className="h-4 w-4 text-muted-foreground shrink-0" />
                      <Input placeholder="https://linkedin.com/jobs/..." {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="flex gap-2">
                <p className="text-xs text-muted-foreground flex-1">
                  Supports: LinkedIn, Indeed, Glassdoor, company career pages
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button type="submit" loading={loading} className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  {loading ? "Importing..." : "Import with AI"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
