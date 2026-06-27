"use client";
import React from "react";
import { motion } from "framer-motion";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: number;
  trendLabel?: string;
  color?: "blue" | "green" | "purple" | "orange" | "red" | "indigo";
  index?: number;
}

const colorMap = {
  blue: { bg: "bg-blue-50 dark:bg-blue-900/20", icon: "text-blue-500", value: "text-blue-600 dark:text-blue-400" },
  green: { bg: "bg-emerald-50 dark:bg-emerald-900/20", icon: "text-emerald-500", value: "text-emerald-600 dark:text-emerald-400" },
  purple: { bg: "bg-purple-50 dark:bg-purple-900/20", icon: "text-purple-500", value: "text-purple-600 dark:text-purple-400" },
  orange: { bg: "bg-orange-50 dark:bg-orange-900/20", icon: "text-orange-500", value: "text-orange-600 dark:text-orange-400" },
  red: { bg: "bg-red-50 dark:bg-red-900/20", icon: "text-red-500", value: "text-red-600 dark:text-red-400" },
  indigo: { bg: "bg-indigo-50 dark:bg-indigo-900/20", icon: "text-indigo-500", value: "text-indigo-600 dark:text-indigo-400" },
};

export function StatCard({ title, value, subtitle, icon: Icon, trend, trendLabel, color = "blue", index = 0 }: StatCardProps) {
  const colors = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Card className="p-5 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
            <p className={cn("mt-1 text-2xl font-bold tabular-nums", colors.value)}>{value}</p>
            {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div className={cn("rounded-xl p-2.5", colors.bg)}>
            <Icon className={cn("h-5 w-5", colors.icon)} />
          </div>
        </div>
        {trend !== undefined && (
          <div className="mt-3 flex items-center gap-1.5">
            {trend > 0 ? (
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
            ) : trend < 0 ? (
              <TrendingDown className="h-3.5 w-3.5 text-red-500" />
            ) : (
              <Minus className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            <span className={cn("text-xs font-medium", trend > 0 ? "text-emerald-600" : trend < 0 ? "text-red-500" : "text-muted-foreground")}>
              {trend > 0 ? "+" : ""}{trend}%
            </span>
            {trendLabel && <span className="text-xs text-muted-foreground">{trendLabel}</span>}
          </div>
        )}
      </Card>
    </motion.div>
  );
}
