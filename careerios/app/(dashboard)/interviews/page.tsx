// @ts-nocheck
"use client";
// @ts-ignore
"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, CalendarCheck, Clock, Video, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InterviewForm } from "@/components/interviews/interview-form";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDatetime, cn } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";
import type { Interview, Application } from "@prisma/client";

type InterviewWithApp = Interview & { application?: Pick<Application,"company"|"jobTitle"> | null };

const TYPE_ICONS: Record<string, React.ElementType> = {
  PHONE_SCREEN: Phone, VIDEO_CALL: Video, TECHNICAL: CalendarCheck,
  BEHAVIORAL: CalendarCheck, SYSTEM_DESIGN: CalendarCheck,
  TAKE_HOME: CalendarCheck, ONSITE: CalendarCheck, HR: CalendarCheck,
  FINAL: CalendarCheck, PANEL: CalendarCheck,
};

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<InterviewWithApp[]>([]);
  const [applications, setApplications] = useState<{id:string;company:string;jobTitle:string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editInterview, setEditInterview] = useState<InterviewWithApp | null>(null);
  const searchParams = useSearchParams();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [intRes, appRes] = await Promise.all([
        fetch("/api/interviews"),
        fetch("/api/applications?limit=100"),
      ]);
      const [intData, appData] = await Promise.all([intRes.json(), appRes.json()]);
      setInterviews(intData.interviews || []);
      setApplications((appData.applications || []).map((a: Application) => ({ id: a.id, company: a.company, jobTitle: a.jobTitle })));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    if (searchParams.get("action") === "new") setDialogOpen(true);
  }, [fetchData, searchParams]);

  const grouped = interviews.reduce((acc, i) => {
    const key = i.status === "SCHEDULED" ? "upcoming" : i.status === "COMPLETED" ? "completed" : "other";
    acc[key] = [...(acc[key] || []), i];
    return acc;
  }, {} as Record<string, InterviewWithApp[]>);

  const upcoming = (grouped.upcoming || []).sort((a,b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  const completed = (grouped.completed || []).sort((a,b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Interviews</h1>
          <p className="text-sm text-muted-foreground">{interviews.length} total interviews</p>
        </div>
        <Button size="sm" onClick={() => setDialogOpen(true)} className="gap-1.5">
          <Plus className="h-4 w-4" /> Schedule Interview
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({length:4}).map((_,i)=><Skeleton key={i} className="h-20 w-full rounded-xl"/>)}</div>
      ) : (
        <div className="space-y-6">
          {upcoming.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Upcoming ({upcoming.length})</h2>
              <div className="space-y-2">
                {upcoming.map((interview) => {
                  const Icon = TYPE_ICONS[interview.type] || CalendarCheck;
                  return (
                    <Link key={interview.id} href={`/dashboard/interviews/${interview.id}`}>
                      <Card className="hover:shadow-sm transition-all cursor-pointer border-l-4 border-l-primary">
                        <CardContent className="flex items-center gap-4 p-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm">{interview.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {interview.application?.company} • {interview.type.replace(/_/g," ")}
                              {interview.platform && ` • ${interview.platform}`}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs font-medium">{formatDatetime(interview.scheduledAt)}</p>
                            <p className="text-[10px] text-muted-foreground">{interview.duration} min</p>
                          </div>
                          {interview.meetingUrl && (
                            <a href={interview.meetingUrl} target="_blank" rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs text-white font-medium hover:bg-primary/90 transition-colors shrink-0">
                              <Video className="h-3.5 w-3.5" /> Join
                            </a>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {completed.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Completed ({completed.length})</h2>
              <div className="space-y-2">
                {completed.map((interview) => (
                  <Link key={interview.id} href={`/dashboard/interviews/${interview.id}`}>
                    <Card className="hover:shadow-sm transition-all cursor-pointer opacity-75 hover:opacity-100">
                      <CardContent className="flex items-center gap-4 p-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted shrink-0">
                          <CalendarCheck className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm">{interview.title}</p>
                          <p className="text-xs text-muted-foreground">{interview.application?.company} • {interview.type.replace(/_/g," ")}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs text-muted-foreground">{formatDatetime(interview.scheduledAt)}</p>
                          {interview.rating && (
                            <div className="flex justify-end mt-0.5">
                              {Array.from({length:5}).map((_,i) => (
                                <span key={i} className={i < (interview.rating||0) ? "text-yellow-400" : "text-muted-foreground/20"}>★</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {interviews.length === 0 && (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <CalendarCheck className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <div>
                <p className="font-semibold">No interviews yet</p>
                <p className="text-sm text-muted-foreground">Schedule your first interview to get started</p>
              </div>
              <Button onClick={() => setDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" /> Schedule Interview
              </Button>
            </div>
          )}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Schedule Interview</DialogTitle></DialogHeader>
          <InterviewForm
            applications={applications}
            applicationId={searchParams.get("applicationId") || undefined}
            onSuccess={() => { setDialogOpen(false); fetchData(); }}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {editInterview && (
        <Dialog open={!!editInterview} onOpenChange={() => setEditInterview(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Edit Interview</DialogTitle></DialogHeader>
            <InterviewForm
              interview={editInterview}
              applications={applications}
              onSuccess={() => { setEditInterview(null); fetchData(); }}
              onCancel={() => setEditInterview(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
