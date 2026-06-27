"use client";
import React from "react";
import { motion } from "framer-motion";
import { formatRelative } from "@/lib/utils";
import {
  Briefcase, CalendarCheck, Users, Network, Gift,
  CheckSquare, FileText, TrendingUp, MessageSquare, Zap
} from "lucide-react";
import type { Activity, ActivityType } from "@/types";

const activityIcons: Record<ActivityType, React.ElementType> = {
  APPLICATION_CREATED: Briefcase,
  APPLICATION_STATUS_CHANGED: TrendingUp,
  APPLICATION_UPDATED: FileText,
  INTERVIEW_SCHEDULED: CalendarCheck,
  INTERVIEW_COMPLETED: CalendarCheck,
  RECRUITER_CONTACTED: Users,
  RECRUITER_REPLIED: MessageSquare,
  NETWORKING_MESSAGE_SENT: Network,
  NETWORKING_REPLY: MessageSquare,
  OFFER_RECEIVED: Gift,
  OFFER_ACCEPTED: Gift,
  OFFER_DECLINED: Gift,
  TASK_COMPLETED: CheckSquare,
  NOTE_ADDED: FileText,
  FOLLOW_UP_SENT: MessageSquare,
};

const activityColors: Record<ActivityType, string> = {
  APPLICATION_CREATED: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  APPLICATION_STATUS_CHANGED: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  APPLICATION_UPDATED: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  INTERVIEW_SCHEDULED: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
  INTERVIEW_COMPLETED: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
  RECRUITER_CONTACTED: "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400",
  RECRUITER_REPLIED: "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400",
  NETWORKING_MESSAGE_SENT: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400",
  NETWORKING_REPLY: "bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400",
  OFFER_RECEIVED: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
  OFFER_ACCEPTED: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  OFFER_DECLINED: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  TASK_COMPLETED: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
  NOTE_ADDED: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
  FOLLOW_UP_SENT: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
};

export function ActivityFeed({ activities }: { activities: Activity[] }) {
  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Zap className="h-6 w-6 text-muted-foreground/50" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">No activity yet</p>
          <p className="text-xs text-muted-foreground/60">Start by adding an application</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {activities.map((activity, index) => {
        const Icon = activityIcons[activity.type] || Zap;
        const colorClass = activityColors[activity.type] || "bg-muted text-muted-foreground";

        return (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03 }}
            className="flex items-start gap-3 rounded-lg p-2.5 hover:bg-muted/50 transition-colors"
          >
            <div className={`mt-0.5 flex h-7 w-7 items-center justify-center rounded-full shrink-0 ${colorClass}`}>
              <Icon className="h-3.5 w-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium leading-tight truncate">{activity.title}</p>
              {activity.description && (
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{activity.description}</p>
              )}
              <p className="text-[10px] text-muted-foreground/50 mt-0.5">{formatRelative(activity.createdAt)}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
