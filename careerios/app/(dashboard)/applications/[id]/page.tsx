// @ts-nocheck
import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase";
import { ApplicationRepository } from "@/lib/repositories/application.repository";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { AICopilot } from "@/components/ai/ai-copilot";
import { APPLICATION_STATUS_LABELS, APPLICATION_STATUS_COLORS } from "@/types";
import { formatDate, formatSalaryRange, cn } from "@/lib/utils";
import { ArrowLeft, ExternalLink, MapPin, DollarSign, Briefcase, Building2, Calendar, Tag } from "lucide-react";
import type { ApplicationStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function ApplicationDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [application, dbUser] = await Promise.all([
    ApplicationRepository.findById(params.id, user.id),
    prisma.user.findUnique({ where: { id: user.id }, select: { name: true } }),
  ]);

  if (!application) notFound();

  const status = application.status as ApplicationStatus;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back + Header */}
      <div className="flex items-start gap-4">
        <Link href="/dashboard/applications" className="mt-1 rounded-lg p-1.5 hover:bg-muted transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">{application.company}</h1>
              <p className="text-muted-foreground">{application.jobTitle}</p>
            </div>
            <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-sm font-medium shrink-0", APPLICATION_STATUS_COLORS[status])}>
              {APPLICATION_STATUS_LABELS[status]}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
            {application.location && (
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {application.location}</span>
            )}
            {(application.salaryMin || application.salaryMax) && (
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                <DollarSign className="h-3 w-3" /> {formatSalaryRange(application.salaryMin, application.salaryMax, application.salaryCurrency)}
              </span>
            )}
            {application.industry && (
              <span className="flex items-center gap-1"><Building2 className="h-3 w-3" /> {application.industry}</span>
            )}
            {application.appliedDate && (
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Applied {formatDate(application.appliedDate)}</span>
            )}
            {application.jobUrl && (
              <a href={application.jobUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                <ExternalLink className="h-3 w-3" /> View Job
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Tags */}
      {application.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {application.tags.map((tag) => (
            <span key={tag} className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs">
              <Tag className="h-2.5 w-2.5" /> {tag}
            </span>
          ))}
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="interviews">Interviews ({application.interviews?.length || 0})</TabsTrigger>
          <TabsTrigger value="ai">AI Copilot</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {application.jobDescription && (
              <Card className="md:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Job Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="max-h-64">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{application.jobDescription}</p>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
            {application.notes && (
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Notes</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{application.notes}</p>
                </CardContent>
              </Card>
            )}
            {application.skills.length > 0 && (
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Skills Required</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1.5">
                    {application.skills.map((skill) => (
                      <span key={skill} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary font-medium">{skill}</span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Status History */}
            {application.statusHistory && application.statusHistory.length > 0 && (
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Status History</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {application.statusHistory.map((h) => (
                      <div key={h.id} className="flex items-center gap-2 text-xs">
                        <span className="text-muted-foreground/60">{formatDate(h.changedAt)}</span>
                        <span className="text-muted-foreground">→</span>
                        <span className={cn("px-2 py-0.5 rounded-full font-medium", APPLICATION_STATUS_COLORS[h.toStatus as ApplicationStatus])}>
                          {APPLICATION_STATUS_LABELS[h.toStatus as ApplicationStatus]}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="interviews" className="mt-4">
          {(application.interviews?.length || 0) === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <p className="text-sm text-muted-foreground">No interviews scheduled yet</p>
              <Link href={`/dashboard/interviews?action=new&applicationId=${application.id}`} className="text-xs text-primary hover:underline">
                Schedule an interview
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {application.interviews?.map((interview) => (
                <Link key={interview.id} href={`/dashboard/interviews/${interview.id}`}>
                  <Card className="hover:shadow-sm transition-all cursor-pointer">
                    <CardContent className="flex items-center justify-between p-4">
                      <div>
                        <p className="font-medium text-sm">{interview.title}</p>
                        <p className="text-xs text-muted-foreground">{interview.type.replace(/_/g," ")} • {formatDate(interview.scheduledAt)}</p>
                      </div>
                      <span className={cn("text-xs px-2.5 py-0.5 rounded-full font-medium",
                        interview.status === "COMPLETED" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" :
                        interview.status === "SCHEDULED" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" :
                        "bg-muted text-muted-foreground"
                      )}>
                        {interview.status}
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="ai" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <AICopilot
                company={application.company}
                jobTitle={application.jobTitle}
                jobDescription={application.jobDescription || ""}
                userName={dbUser?.name || "there"}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <Card>
            <CardContent className="pt-4">
              <ScrollArea className="max-h-96">
                <ActivityFeed activities={application.activities || []} />
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
