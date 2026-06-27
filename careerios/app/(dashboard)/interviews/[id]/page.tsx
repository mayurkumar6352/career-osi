// @ts-nocheck
import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase";
import { InterviewRepository } from "@/lib/repositories/interview.repository";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AICopilot } from "@/components/ai/ai-copilot";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDatetime, cn } from "@/lib/utils";
import { ArrowLeft, Calendar, Clock, Video, MapPin, Star, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function InterviewDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [interview, dbUser] = await Promise.all([
    InterviewRepository.findById(params.id, user.id),
    prisma.user.findUnique({ where: { id: user.id }, select: { name: true } }),
  ]);
  if (!interview) notFound();

  const statusColors: Record<string, string> = {
    SCHEDULED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    COMPLETED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    CANCELLED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    RESCHEDULED: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
    NO_SHOW: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start gap-4">
        <Link href="/dashboard/interviews" className="mt-1 rounded-lg p-1.5 hover:bg-muted transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">{interview.title}</h1>
              {interview.application && (
                <p className="text-muted-foreground">
                  {interview.application.company} — {interview.application.jobTitle}
                </p>
              )}
            </div>
            <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-sm font-medium shrink-0", statusColors[interview.status] || "bg-muted text-muted-foreground")}>
              {interview.status}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {formatDatetime(interview.scheduledAt)}</span>
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {interview.duration} minutes</span>
            {interview.platform && <span className="flex items-center gap-1"><Video className="h-3.5 w-3.5" /> {interview.platform}</span>}
            {interview.location && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {interview.location}</span>}
            {interview.interviewers.length > 0 && (
              <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {interview.interviewers.join(", ")}</span>
            )}
          </div>
          {interview.meetingUrl && (
            <a href={interview.meetingUrl} target="_blank" rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-1.5 text-sm text-white font-medium hover:bg-primary/90 transition-colors">
              <Video className="h-4 w-4" /> Join Meeting
            </a>
          )}
        </div>
      </div>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="prep">Preparation</TabsTrigger>
          <TabsTrigger value="ai">AI Copilot</TabsTrigger>
          {interview.status === "COMPLETED" && <TabsTrigger value="feedback">Feedback</TabsTrigger>}
        </TabsList>

        <TabsContent value="details" className="mt-4 space-y-4">
          {interview.rating && (
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground mb-1">Your Rating</p>
                <div className="flex gap-0.5">
                  {Array.from({length:5}).map((_,i) => (
                    <Star key={i} className={cn("h-5 w-5", i < interview.rating! ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30")} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          {interview.notes && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Notes</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-muted-foreground whitespace-pre-wrap">{interview.notes}</p></CardContent>
            </Card>
          )}
          {interview.questionsAsked.length > 0 && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Questions Asked</CardTitle></CardHeader>
              <CardContent>
                <ol className="space-y-1.5">
                  {interview.questionsAsked.map((q, i) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <span className="text-muted-foreground shrink-0 tabular-nums">{i + 1}.</span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          )}
          {interview.nextSteps && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Next Steps</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-muted-foreground whitespace-pre-wrap">{interview.nextSteps}</p></CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="prep" className="mt-4">
          {interview.prepNotes ? (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Preparation Notes</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-muted-foreground whitespace-pre-wrap">{interview.prepNotes}</p></CardContent>
            </Card>
          ) : (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <p className="text-sm text-muted-foreground">No prep notes yet. Use AI Copilot to generate interview questions!</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="ai" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <AICopilot
                company={interview.application?.company || ""}
                jobTitle={interview.application?.jobTitle || ""}
                userName={dbUser?.name || "there"}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {interview.status === "COMPLETED" && (
          <TabsContent value="feedback" className="mt-4">
            {interview.feedback ? (
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Interviewer Feedback</CardTitle></CardHeader>
                <CardContent><p className="text-sm text-muted-foreground whitespace-pre-wrap">{interview.feedback}</p></CardContent>
              </Card>
            ) : (
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <p className="text-sm text-muted-foreground">No feedback recorded</p>
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
