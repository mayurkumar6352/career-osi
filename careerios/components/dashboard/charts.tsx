"use client";
import React from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, FunnelChart, Funnel, LabelList,
  AreaChart, Area
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const BRAND_COLORS = ["#5c7cfa", "#7c3aed", "#ec4899", "#f97316", "#22c55e", "#06b6d4", "#eab308", "#ef4444"];

interface MonthlyChartProps {
  data: { month: string; applications: number; responses: number; interviews: number; offers: number }[];
}

export function MonthlyApplicationsChart({ data }: MonthlyChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Monthly Activity</CardTitle>
        <CardDescription className="text-xs">Applications and progress over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="appGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#5c7cfa" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#5c7cfa" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="intGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
              labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
            />
            <Area type="monotone" dataKey="applications" name="Applications" stroke="#5c7cfa" fill="url(#appGrad)" strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="interviews" name="Interviews" stroke="#22c55e" fill="url(#intGrad)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

interface FunnelData {
  stage: string;
  count: number;
  rate: number;
}

export function ApplicationFunnelChart({ data }: { data: FunnelData[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Application Funnel</CardTitle>
        <CardDescription className="text-xs">Conversion at each stage</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {data.map((item, i) => (
            <div key={item.stage} className="flex items-center gap-3">
              <span className="w-28 text-xs text-muted-foreground truncate">{item.stage}</span>
              <div className="flex-1 h-6 bg-muted rounded-md overflow-hidden">
                <div
                  className="h-full rounded-md transition-all duration-500 flex items-center px-2"
                  style={{
                    width: `${Math.max(item.rate, 5)}%`,
                    backgroundColor: BRAND_COLORS[i % BRAND_COLORS.length],
                  }}
                >
                  <span className="text-[10px] text-white font-semibold whitespace-nowrap">{item.count}</span>
                </div>
              </div>
              <span className="w-10 text-xs text-muted-foreground text-right">{item.rate}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function IndustryBreakdownChart({ data }: { data: { label: string; value: number }[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Industry Breakdown</CardTitle>
        <CardDescription className="text-xs">Applications by industry</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value" nameKey="label">
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={BRAND_COLORS[index % BRAND_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-2 flex flex-wrap gap-2">
          {data.slice(0, 5).map((item, i) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: BRAND_COLORS[i % BRAND_COLORS.length] }} />
              <span className="text-xs text-muted-foreground">{item.label} ({item.value})</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function SourceBreakdownChart({ data }: { data: { label: string; value: number }[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Application Sources</CardTitle>
        <CardDescription className="text-xs">Where applications are coming from</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
            <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="label" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={70} />
            <Tooltip
              contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
            />
            <Bar dataKey="value" name="Applications" radius={[0, 4, 4, 0]}>
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={BRAND_COLORS[index % BRAND_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
