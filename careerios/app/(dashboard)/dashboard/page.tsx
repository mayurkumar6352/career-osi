// @ts-nocheck
import React from "react";
import { createServerSupabase } from "@/lib/supabase-server";
import { DashboardRepository } from "@/lib/repositories/dashboard.repository";
import { ApplicationRepository } from "@/lib/repositories/application.repository";
import { InterviewRepository } from "@/lib/repositories/interview.repository";
import { TaskRepository } from "@/lib/repositories/task.repository";
import { StatCard } from "@/components/dashboard/stat-card";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { MonthlyApplicationsChart, ApplicationFunnelChart, IndustryBreakdownChart, SourceBreakdownChart } from "@/components/dashboard/charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Briefcase, TrendingUp, CalendarCheck, Users, Network,
  Target, Gift, AlertCircle, Clock, Flame
} from "lucide-react";
import { formatDate, formatDatetime, cn } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [stats, monthlyData, industryData, sourceData, upcomingInterviews, dueTasks] = await Promise.all([
    DashboardRepository.getStats(user.id),
    ApplicationRepository.getMonthlyData(user.id),
    DashboardRepository.getIndustryBreakdown(user.id),
    DashboardRepository.getSourceBreakdown(user.id),
    InterviewRepository.findUpcoming(user.id, 7),
    TaskRepository.findDue(user.id),
  ]);

  const funnelData = [
    { stage: "Applied", count: stats.totalApplications, rate: 100 },
    { stage: "Responded", count: Math.round(stats.totalApplications * stats.responseRate / 100), rate: stats.responseRate },
    { stage: "Interviews", count: Math.round(stats.totalApplications * stats.interviewRate / 100), rate: stats.interviewRate },
    { stage: "Offers", count: stats.offersReceived, rate: stats.offerRate },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Your career at a glance</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border bg-orange-50 dark:bg-orange-900/20 px-3 py-1">
          <Flame className="h-4 w-4 text-orange-500" />
          <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">Active</span>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard title="Total Applications" value={stats.totalApplications} icon={<Briefcase className="h-5 w-5" />} color="blue" index={0} />
        <StatCard title="Active Pipeline" value={stats.activeApplications} icon={<TrendingUp className="h-5 w-5" />} color="indigo" index={1} />
        <StatCard title="Interviews Soon" value={stats.interviewsScheduled} icon={<CalendarCheck className="h-5 w-5" />} color="purple" index={2} />
        <StatCard title="Recruiters" value={stats.recruitersContacted} icon={<Users className="h-5 w-5" />} color="orange" index={3} />
        <StatCard title="Network" value={stats.networkingContacts} icon={<Network className="h-5 w-5" />} color="green" index={4} />
        <StatCard title="Response Rate" value={`${stats.responseRate}%`} icon={<Target className="h-5 w-5" />} color="blue" index={5} />
        <StatCard title="Interview Rate" value={`${stats.interviewRate}%`} icon={<CalendarCheck className="h-5 w-5" />} color="indigo" index={6} />
        <StatCard title="Offer Rate" value={`${stats.offerRate}%`} icon={<Gift className="h-5 w-5" />} color="green" index={7} />
        <StatCard title="Rejection Rate" value={`${stats.rejectionRate}%`} icon={<AlertCircle className="h-5 w-5" />} color="red" index={8} />
        <StatCard title="Tasks Due" value={stats.tasksDue} icon={<Clock className="h-5 w-5" />} color="orange" index={9} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2"><MonthlyApplicationsChart data={monthlyData} /></div>
        <ApplicationFunnelChart data={funnelData} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <IndustryBreakdownChart data={industryData} />
        <SourceBreakdownChart data={sourceData} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <CalendarCheck className="h-4 w-4 text-primary" /> Upcoming Interviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingInterviews.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <CalendarCheck className="h-8 w-8 text-muted-foreground/30" />
                <p className="text-xs text-muted-foreground">No upcoming interviews</p>
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingInterviews.slice(0, 5).map((interview) => (
                  <Link key={interview.id} href={`/dashboard/interviews/${interview.id}`} className="flex items-start gap-3 rounded-lg p-2 hover:bg-muted/50 transition-colors">
                    <div className="flex h-9 w-9 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                      <span className="text-[10px] font-bold">{new Date(interview.scheduledAt).getDate()}</span>
                      <span className="text-[8px]">{new Date(interview.scheduledAt).toLocaleString("default", { month: "short" })}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{interview.title}</p>
                      <p className="text-[10px] text-muted-foreground">{(interview as any).application?.company} • {interview.type.replace(/_/g," ")}</p>
                      <p className="text-[10px] text-muted-foreground/60">{formatDatetime(interview.scheduledAt)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Clock className="h-4 w-4 text-orange-500" /> Tasks Due
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dueTasks.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <Clock className="h-8 w-8 text-muted-foreground/30" />
                <p className="text-xs text-muted-foreground">All caught up!</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {dueTasks.slice(0, 6).map((task) => (
                  <div key={task.id} className="flex items-start gap-2.5 rounded-lg p-2 hover:bg-muted/50">
                    <div className={cn("mt-0.5 h-2 w-2 rounded-full shrink-0",
                      task.priority === "URGENT" ? "bg-red-500" : task.priority === "HIGH" ? "bg-orange-500" : task.priority === "MEDIUM" ? "bg-blue-500" : "bg-slate-400"
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{task.title}</p>
                      {task.dueDate && <p className="text-[10px] text-muted-foreground">{formatDate(task.dueDate)}</p>}
                    </div>
                    <span className={cn("text-[9px] font-semibold px-1.5 py-0.5 rounded-full",
                      task.priority === "URGENT" ? "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400" :
                      task.priority === "HIGH" ? "bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400" : "bg-muted text-muted-foreground"
                    )}>{task.priority}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <ActivityFeed activities={stats.recentActivities} />
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
