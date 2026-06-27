// @ts-nocheck
"use client";
import React, { useState, useOptimistic } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MoreHorizontal, Plus } from "lucide-react";
import { APPLICATION_STATUS_LABELS, APPLICATION_STATUS_COLORS } from "@/types";
import { updateApplicationStatus } from "@/lib/actions/application.actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn, formatDate, formatSalaryRange } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";
import type { Application, ApplicationStatus } from "@prisma/client";

const KANBAN_COLUMNS: ApplicationStatus[] = [
  "SAVED", "APPLIED", "ASSESSMENT", "RECRUITER_SCREEN",
  "INTERVIEW_R1", "INTERVIEW_R2", "FINAL_INTERVIEW",
  "OFFER", "NEGOTIATION", "ACCEPTED", "REJECTED", "GHOSTED"
];

interface KanbanBoardProps {
  applications: Application[];
  onNewApplication?: (status: ApplicationStatus) => void;
}

export function KanbanBoard({ applications, onNewApplication }: KanbanBoardProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<ApplicationStatus | null>(null);
  const [optimisticApps, setOptimisticApps] = useState(applications);

  const grouped = KANBAN_COLUMNS.reduce((acc, status) => {
    acc[status] = optimisticApps.filter((a) => a.status === status);
    return acc;
  }, {} as Record<ApplicationStatus, Application[]>);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = async (e: React.DragEvent, status: ApplicationStatus) => {
    e.preventDefault();
    if (!draggedId) return;

    const app = optimisticApps.find((a) => a.id === draggedId);
    if (!app || app.status === status) return;

    setOptimisticApps((prev) => prev.map((a) => a.id === draggedId ? { ...a, status } : a));
    setDraggedId(null);
    setDragOverColumn(null);

    const result = await updateApplicationStatus(draggedId, status);
    if (!result.success) {
      setOptimisticApps(applications);
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
      {KANBAN_COLUMNS.map((status) => {
        const cards = grouped[status] || [];
        const isDragOver = dragOverColumn === status;
        const colorClass = APPLICATION_STATUS_COLORS[status];

        return (
          <div
            key={status}
            className={cn(
              "flex w-64 flex-shrink-0 flex-col rounded-xl border bg-muted/30 transition-all",
              isDragOver && "ring-2 ring-primary/50 bg-primary/5"
            )}
            onDragOver={(e) => { e.preventDefault(); setDragOverColumn(status); }}
            onDragLeave={() => setDragOverColumn(null)}
            onDrop={(e) => handleDrop(e, status)}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between p-3">
              <div className="flex items-center gap-2">
                <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", colorClass)}>
                  {APPLICATION_STATUS_LABELS[status]}
                </span>
                <span className="text-xs text-muted-foreground font-medium tabular-nums">
                  {cards.length}
                </span>
              </div>
              {onNewApplication && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onNewApplication(status)}
                  className="h-5 w-5 opacity-50 hover:opacity-100"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              )}
            </div>

            {/* Cards */}
            <div className="flex-1 space-y-2 overflow-y-auto p-2 max-h-[calc(100vh-260px)] scrollbar-hide">
              <AnimatePresence>
                {cards.map((app) => (
                  <motion.div
                    key={app.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    draggable
                    onDragStart={(e) => handleDragStart(e as any, app.id)}
                    onDragEnd={() => setDraggedId(null)}
                    className={cn(
                      "rounded-lg border bg-card p-3 cursor-grab active:cursor-grabbing hover:shadow-sm transition-all group",
                      draggedId === app.id && "opacity-50 scale-95"
                    )}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div className="flex-1 min-w-0">
                        <Link href={`/dashboard/applications/${app.id}`}>
                          <p className="text-xs font-semibold truncate hover:text-primary transition-colors">{app.company}</p>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">{app.jobTitle}</p>
                        </Link>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm" className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/applications/${app.id}`}>View Details</Link>
                          </DropdownMenuItem>
                          {["SAVED","APPLIED","REJECTED","ARCHIVED"].map((s) => s !== app.status && (
                            <DropdownMenuItem
                              key={s}
                              onClick={() => updateApplicationStatus(app.id, s as ApplicationStatus).then((r) => {
                                if (r.success) {
                                  setOptimisticApps((prev) => prev.map((a) => a.id === app.id ? { ...a, status: s as ApplicationStatus } : a));
                                  toast.success("Status updated");
                                }
                              })}
                            >
                              Move to {APPLICATION_STATUS_LABELS[s as ApplicationStatus]}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {app.location && (
                      <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1">
                        📍 {app.location}
                      </p>
                    )}

                    {(app.salaryMin || app.salaryMax) && (
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1">
                        {formatSalaryRange(app.salaryMin, app.salaryMax, app.salaryCurrency)}
                      </p>
                    )}

                    <div className="mt-2 flex items-center justify-between">
                      <span className={cn(
                        "text-[9px] font-semibold px-1.5 py-0.5 rounded-full",
                        app.priority === "URGENT" ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" :
                        app.priority === "HIGH" ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" :
                        app.priority === "MEDIUM" ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" :
                        "bg-muted text-muted-foreground"
                      )}>
                        {app.priority}
                      </span>
                      <span className="text-[10px] text-muted-foreground/60">
                        {app.appliedDate ? formatDate(app.appliedDate) : formatDate(app.createdAt)}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {cards.length === 0 && (
                <div className={cn(
                  "flex h-16 items-center justify-center rounded-lg border-2 border-dashed text-xs text-muted-foreground transition-colors",
                  isDragOver ? "border-primary/50 text-primary" : "border-muted-foreground/20"
                )}>
                  Drop here
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
