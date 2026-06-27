// @ts-nocheck
"use client";
// @ts-ignore
"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, CheckSquare, Check, Trash2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TaskSchema, type TaskInput } from "@/lib/validators/task";
import { createTask, completeTask, deleteTask } from "@/lib/actions/task.actions";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate, cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Task } from "@prisma/client";

const PRIORITY_COLORS: Record<string, string> = {
  URGENT: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  HIGH: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
  MEDIUM: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  LOW: "bg-muted text-muted-foreground",
};

function TaskForm({ onSuccess, onCancel }: { onSuccess?: () => void; onCancel?: () => void }) {
  const [loading, setLoading] = useState(false);
  const form = useForm<TaskInput>({
    resolver: zodResolver(TaskSchema),
    defaultValues: { title: "", description: "", status: "TODO", priority: "MEDIUM", category: "GENERAL" },
  });

  const onSubmit = async (data: TaskInput) => {
    setLoading(true);
    try {
      const result = await createTask(data);
      if (result.success) { toast.success("Task created"); onSuccess?.(); }
      else toast.error(result.error);
    } finally { setLoading(false); }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="title" render={({ field }) => (
          <FormItem><FormLabel>Title *</FormLabel><FormControl><Input placeholder="Follow up with recruiter..." {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea rows={2} {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <div className="grid grid-cols-3 gap-4">
          <FormField control={form.control} name="priority" render={({ field }) => (
            <FormItem>
              <FormLabel>Priority</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  {["LOW","MEDIUM","HIGH","URGENT"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="category" render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  {["FOLLOW_UP","INTERVIEW_PREP","NETWORKING","RESEARCH","APPLICATION","GENERAL"].map(c => (
                    <SelectItem key={c} value={c}>{c.replace(/_/g," ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="dueDate" render={({ field }) => (
            <FormItem>
              <FormLabel>Due Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} value={field.value instanceof Date ? field.value.toISOString().slice(0,10) : String(field.value || "")} onChange={e => field.onChange(e.target.value ? new Date(e.target.value) : null)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <div className="flex justify-end gap-3">
          {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
          <Button type="submit" loading={loading}>Create Task</Button>
        </div>
      </form>
    </Form>
  );
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const searchParams = useSearchParams();

  const fetch_ = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      setTasks(data.tasks || []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);
  useEffect(() => { if (searchParams.get("action") === "new") setDialogOpen(true); }, [searchParams]);

  const handleComplete = async (id: string) => {
    const result = await completeTask(id);
    if (result.success) { toast.success("Task completed! 🎉"); fetch_(); }
    else toast.error(result.error);
  };

  const handleDelete = async (id: string) => {
    const result = await deleteTask(id);
    if (result.success) { toast.success("Task deleted"); fetch_(); }
    else toast.error(result.error);
  };

  const pending = tasks.filter(t => t.status !== "DONE" && t.status !== "CANCELLED");
  const done = tasks.filter(t => t.status === "DONE");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tasks</h1>
          <p className="text-sm text-muted-foreground">{pending.length} pending · {done.length} completed</p>
        </div>
        <Button size="sm" onClick={() => setDialogOpen(true)} className="gap-1.5">
          <Plus className="h-4 w-4" /> Add Task
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({length:5}).map((_,i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}</div>
      ) : (
        <div className="space-y-6">
          {pending.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Pending ({pending.length})</h2>
              <div className="space-y-2">
                {pending.sort((a,b) => {
                  const pOrder = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
                  return (pOrder[a.priority] || 3) - (pOrder[b.priority] || 3);
                }).map(task => (
                  <Card key={task.id} className="group hover:shadow-sm transition-all">
                    <CardContent className="flex items-center gap-3 p-3">
                      <button
                        onClick={() => handleComplete(task.id)}
                        className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-muted-foreground/30 hover:border-primary hover:bg-primary/10 transition-all shrink-0"
                      >
                        <Circle className="h-2.5 w-2.5 text-transparent group-hover:text-primary/50 transition-colors" />
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{task.title}</p>
                        {task.description && <p className="text-xs text-muted-foreground truncate">{task.description}</p>}
                        <div className="mt-1 flex items-center gap-2">
                          <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full", PRIORITY_COLORS[task.priority])}>
                            {task.priority}
                          </span>
                          <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                            {task.category.replace(/_/g," ")}
                          </span>
                          {task.dueDate && (
                            <span className={cn("text-[10px] font-medium", new Date(task.dueDate) < new Date() ? "text-red-500" : "text-muted-foreground")}>
                              Due {formatDate(task.dueDate)}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {done.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Completed ({done.length})</h2>
              <div className="space-y-2">
                {done.slice(0, 10).map(task => (
                  <Card key={task.id} className="opacity-50 hover:opacity-75 transition-opacity">
                    <CardContent className="flex items-center gap-3 p-3">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 shrink-0">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                      <p className="text-sm line-through text-muted-foreground">{task.title}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {tasks.length === 0 && (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <CheckSquare className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <div><p className="font-semibold">No tasks yet</p><p className="text-sm text-muted-foreground">Create tasks to stay on top of your job search</p></div>
              <Button onClick={() => setDialogOpen(true)} className="gap-2"><Plus className="h-4 w-4" /> Add Task</Button>
            </div>
          )}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Create Task</DialogTitle></DialogHeader>
          <TaskForm onSuccess={() => { setDialogOpen(false); fetch_(); }} onCancel={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
