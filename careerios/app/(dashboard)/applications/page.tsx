"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, Filter, LayoutGrid, List, Download, Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { KanbanBoard } from "@/components/applications/kanban-board";
import { ApplicationTable } from "@/components/applications/application-table";
import { ApplicationForm } from "@/components/applications/application-form";
import { ImportJobDialog } from "@/components/applications/import-job-dialog";
import { AICopilot } from "@/components/ai/ai-copilot";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import type { Application, ApplicationStatus } from "@/types";

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"kanban" | "table">("kanban");
  const [newDialogOpen, setNewDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [editApp, setEditApp] = useState<Application | null>(null);
  const [initialStatus, setInitialStatus] = useState<ApplicationStatus>("APPLIED");
  const searchParams = useSearchParams();

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/applications");
      const data = await res.json();
      setApplications(data.applications || []);
    } catch {
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
    if (searchParams.get("action") === "new") setNewDialogOpen(true);
  }, [fetchApplications, searchParams]);

  const handleNewApp = (status?: ApplicationStatus) => {
    if (status) setInitialStatus(status);
    setNewDialogOpen(true);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Applications</h1>
          <p className="text-sm text-muted-foreground">{applications.length} total applications</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setImportDialogOpen(true)} className="gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> AI Import
          </Button>
          <Button size="sm" onClick={() => handleNewApp()} className="gap-1.5">
            <Plus className="h-4 w-4" /> Add Application
          </Button>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex items-center gap-2">
        <div className="flex items-center rounded-lg border p-0.5">
          <button
            onClick={() => setView("kanban")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${view === "kanban" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            <LayoutGrid className="h-3.5 w-3.5" /> Kanban
          </button>
          <button
            onClick={() => setView("table")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${view === "table" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            <List className="h-3.5 w-3.5" /> Table
          </button>
        </div>
        <Button variant="ghost" size="sm" onClick={fetchApplications} className="gap-1.5 text-muted-foreground">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-8 w-full" />
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-48 w-full rounded-xl" />
            ))}
          </div>
        </div>
      ) : view === "kanban" ? (
        <KanbanBoard applications={applications} onNewApplication={handleNewApp} />
      ) : (
        <ApplicationTable applications={applications} onEdit={setEditApp} onRefresh={fetchApplications} />
      )}

      {/* New Application Dialog */}
      <Dialog open={newDialogOpen} onOpenChange={setNewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Application</DialogTitle>
          </DialogHeader>
          <ApplicationForm
            onSuccess={() => { setNewDialogOpen(false); fetchApplications(); }}
            onCancel={() => setNewDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      {editApp && (
        <Dialog open={!!editApp} onOpenChange={() => setEditApp(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Application</DialogTitle>
            </DialogHeader>
            <ApplicationForm
              application={editApp}
              onSuccess={() => { setEditApp(null); fetchApplications(); }}
              onCancel={() => setEditApp(null)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Import Dialog */}
      <ImportJobDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onSuccess={() => { setImportDialogOpen(false); fetchApplications(); }}
      />
    </div>
  );
}
