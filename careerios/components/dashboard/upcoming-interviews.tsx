"use client";
import React from "react";
import Link from "next/link";
import { Calendar, Clock, Video, MapPin, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDatetime, formatDate } from "@/lib/utils";
import { INTERVIEW_TYPE_LABELS } from "@/types";
import type { InterviewWithApplication } from "@/types";

interface UpcomingInterviewsProps {
  interviews: InterviewWithApplication[];
}

export function UpcomingInterviews({ interviews }: UpcomingInterviewsProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">Upcoming Interviews</CardTitle>
          <Link href="/dashboard/interviews">
            <Button variant="ghost" size="sm" className="h-7 text-xs">View all</Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {interviews.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <Calendar className="h-8 w-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No upcoming interviews</p>
          </div>
        ) : (
          interviews.map((interview) => (
            <Link key={interview.id} href={`/dashboard/interviews/${interview.id}`}>
              <div className="flex gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium truncate">
                      {interview.application?.company || interview.title}
                    </span>
                    <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                      {INTERVIEW_TYPE_LABELS[interview.type]}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {interview.application?.jobTitle || interview.title}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDatetime(interview.scheduledAt)}
                    </span>
                    {interview.duration && (
                      <span className="text-xs text-muted-foreground">{interview.duration}m</span>
                    )}
                    {interview.platform && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Video className="h-3 w-3" />
                        {interview.platform}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}
