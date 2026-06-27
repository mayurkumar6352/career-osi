// @ts-nocheck
import React from "react";
import { createServerSupabase } from "@/lib/supabase";
import { ApplicationRepository } from "@/lib/repositories/application.repository";
import { DashboardRepository } from "@/lib/repositories/dashboard.repository";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MonthlyApplicationsChart, ApplicationFunnelChart, IndustryBreakdownChart, SourceBreakdownChart } from "@/components/dashboard/charts";

export const dynamic = "force-dynamic";
export const metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [stats, monthlyData, industryData, sourceData] = await Promise.all([
    ApplicationRepository.getStats(user.id),
    ApplicationRepository.getMonthlyData(user.id),
    DashboardRepository.getIndustryBreakdown(user.id),
    DashboardRepository.getSourceBreakdown(user.id),
  ]);

  const funnelData = [
    { stage: "Saved", count: stats.total, rate: 100 },
    { stage: "Applied", count: stats.applied, rate: stats.applied > 0 ? 100 : 0 },
    { stage: "Interviews", count: stats.interviews, rate: stats.interviewRate },
    { stage: "Offers", count: stats.offers, rate: stats.offerRate },
    { stage: "Accepted", count: stats.accepted, rate: stats.applied > 0 ? Math.round((stats.accepted / stats.applied) * 100) : 0 },
  ];

  const rateCards = [
    { label: "Response Rate", value: stats.responseRate, desc: "Applications that got a response", color: "text-blue-500" },
    { label: "Interview Rate", value: stats.interviewRate, desc: "Applications that led to interviews", color: "text-purple-500" },
    { label: "Offer Rate", value: stats.offerRate, desc: "Applications that led to offers", color: "text-emerald-500" },
    { label: "Rejection Rate", value: stats.rejectionRate, desc: "Applications rejected", color: "text-red-500" },
    { label: "Ghosted Rate", value: stats.applied > 0 ? Math.round((stats.ghosted / stats.applied) * 100) : 0, desc: "Applications with no response", color: "text-gray-500" },
    { label: "Acceptance Rate", value: stats.offers > 0 ? Math.round((stats.accepted / stats.offers) * 100) : 0, desc: "Offers accepted", color: "text-emerald-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-muted-foreground">Insights into your job search performance</p>
      </div>

      {/* Key Rates */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        {rateCards.map(({ label, value, desc, color }) => (
          <Card key={label} className="text-center">
            <CardContent className="pt-4 pb-3">
              <p className={`text-2xl font-bold tabular-nums ${color}`}>{value}%</p>
              <p className="text-xs font-medium mt-0.5">{label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        {[
          { label: "Total Applications", value: stats.total, color: "text-blue-500" },
          { label: "Interviews", value: stats.interviews, color: "text-indigo-500" },
          { label: "Offers Received", value: stats.offers, color: "text-emerald-500" },
          { label: "Offers Accepted", value: stats.accepted, color: "text-green-600" },
        ].map(({ label, value, color }) => (
          <Card key={label}>
            <CardContent className="pt-5 pb-4">
              <p className={`text-3xl font-bold tabular-nums ${color}`}>{value}</p>
              <p className="text-sm text-muted-foreground mt-1">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2"><MonthlyApplicationsChart data={monthlyData} /></div>
        <ApplicationFunnelChart data={funnelData} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <IndustryBreakdownChart data={industryData} />
        <SourceBreakdownChart data={sourceData} />
      </div>
    </div>
  );
}
