"use client";
import React from "react";
import { Flame, Zap, Trophy, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StreakWidgetProps {
  currentStreak: number;
  longestStreak: number;
  totalApplications: number;
  weeklyGoal: number;
  weeklyProgress: number;
}

export function StreakWidget({ currentStreak, longestStreak, totalApplications, weeklyGoal, weeklyProgress }: StreakWidgetProps) {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const today = new Date().getDay();
  // Map Sun=0 to index 6, Mon=1 to index 0, etc.
  const todayIndex = today === 0 ? 6 : today - 1;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">Job Search Streak</CardTitle>
          <div className="flex items-center gap-1.5">
            <Flame className={cn("h-4 w-4", currentStreak > 0 ? "text-orange-500" : "text-muted-foreground/30")} />
            <span className={cn("text-sm font-bold tabular-nums", currentStreak > 0 ? "text-orange-500" : "text-muted-foreground")}>
              {currentStreak}d
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Week View */}
        <div className="flex items-center justify-between gap-1">
          {days.map((day, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition-all",
                i < todayIndex ? "bg-primary/20 text-primary" :
                i === todayIndex ? "bg-primary text-primary-foreground shadow-sm" :
                "bg-muted text-muted-foreground/40"
              )}>
                {i < todayIndex ? "✓" : i === todayIndex ? <Zap className="h-3.5 w-3.5" /> : day}
              </div>
              <span className="text-[9px] text-muted-foreground">{day}</span>
            </div>
          ))}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 divide-x text-center">
          <div className="px-2">
            <p className="text-xs text-muted-foreground">Current</p>
            <p className="text-lg font-bold text-orange-500">{currentStreak}d</p>
          </div>
          <div className="px-2">
            <p className="text-xs text-muted-foreground">Longest</p>
            <p className="text-lg font-bold">{longestStreak}d</p>
          </div>
          <div className="px-2">
            <p className="text-xs text-muted-foreground">Total Apps</p>
            <p className="text-lg font-bold">{totalApplications}</p>
          </div>
        </div>

        {/* Weekly Progress */}
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-muted-foreground">Weekly goal</span>
            <span className="font-medium">{weeklyProgress}/{weeklyGoal} apps</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${Math.min(100, (weeklyProgress / weeklyGoal) * 100)}%` }}
            />
          </div>
        </div>

        {/* Achievements */}
        <div className="flex gap-2 flex-wrap">
          {totalApplications >= 10 && (
            <div className="flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-900/20 px-2 py-1">
              <Trophy className="h-3 w-3 text-amber-500" />
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">10 Apps</span>
            </div>
          )}
          {totalApplications >= 50 && (
            <div className="flex items-center gap-1 rounded-full bg-purple-50 dark:bg-purple-900/20 px-2 py-1">
              <Trophy className="h-3 w-3 text-purple-500" />
              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-medium">50 Apps</span>
            </div>
          )}
          {currentStreak >= 7 && (
            <div className="flex items-center gap-1 rounded-full bg-orange-50 dark:bg-orange-900/20 px-2 py-1">
              <Flame className="h-3 w-3 text-orange-500" />
              <span className="text-[10px] text-orange-600 dark:text-orange-400 font-medium">7-Day Streak</span>
            </div>
          )}
          {currentStreak >= 30 && (
            <div className="flex items-center gap-1 rounded-full bg-red-50 dark:bg-red-900/20 px-2 py-1">
              <Flame className="h-3 w-3 text-red-500" />
              <span className="text-[10px] text-red-600 dark:text-red-400 font-medium">30-Day Streak</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
