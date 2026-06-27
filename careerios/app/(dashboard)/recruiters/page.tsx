// @ts-nocheck
"use client";
// @ts-ignore
"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Users, Star, Mail, Phone, Linkedin, MoreHorizontal, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RecruiterSchema, type RecruiterInput } from "@/lib/validators/recruiter";
import { createRecruiter, updateRecruiter, deleteRecruiter } from "@/lib/actions/recruiter.actions";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getInitials, generateColor, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import type { Recruiter } from "@prisma/client";

function RecruiterForm({ recruiter, onSuccess, onCancel }: { recruiter?: Recruiter; onSuccess?: () => void; onCancel?: () => void }) {
  const [loading, setLoading] = useState(false);
  const form = useForm<RecruiterInput>({
    resolver: zodResolver(RecruiterSchema),
    defaultValues: {
      name: recruiter?.name || "",
      email: recruiter?.email || "",
      phone: recruiter?.phone || "",
      title: recruiter?.title || "",
      company: recruiter?.company || "",
      linkedinUrl: recruiter?.linkedinUrl || "",
      type: recruiter?.type || "RECRUITER",
      relationshipScore: recruiter?.relationshipScore || 50,
      notes: recruiter?.notes || "",
      tags: recruiter?.tags || [],
    },
  });

  const onSubmit = async (data: RecruiterInput) => {
    setLoading(true);
    try {
      const result = recruiter ? await updateRecruiter(recruiter.id, data) : await createRecruiter(data);
      if (result.success) { toast.success(recruiter ? "Recruiter updated" : "Recruiter added"); onSuccess?.(); }
      else toast.error(result.error);
    } finally { setLoading(false); }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem><FormLabel>Name *</FormLabel><FormControl><Input placeholder="John Smith" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="type" render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  {["RECRUITER","HIRING_MANAGER","FOUNDER","HR","REFERRAL","HEADHUNTER"].map(t => (
                    <SelectItem key={t} value={t}>{t.replace(/_/g," ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="company" render={({ field }) => (
            <FormItem><FormLabel>Company</FormLabel><FormControl><Input placeholder="Google..." {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="title" render={({ field }) => (
            <FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="Technical Recruiter" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="john@company.com" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="phone" render={({ field }) => (
            <FormItem><FormLabel>Phone</FormLabel><FormControl><Input placeholder="+1 555 000 0000" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <FormField control={form.control} name="linkedinUrl" render={({ field }) => (
          <FormItem><FormLabel>LinkedIn URL</FormLabel><FormControl><Input placeholder="https://linkedin.com/in/..." {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="notes" render={({ field }) => (
          <FormItem><FormLabel>Notes</FormLabel><FormControl><Textarea placeholder="Notes about this contact..." rows={3} {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <div className="flex justify-end gap-3">
          {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
          <Button type="submit" loading={loading}>{recruiter ? "Save Changes" : "Add Recruiter"}</Button>
        </div>
      </form>
    </Form>
  );
}

export default function RecruitersPage() {
  const [recruiters, setRecruiters] = useState<Recruiter[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editRec, setEditRec] = useState<Recruiter | null>(null);
  const searchParams = useSearchParams();

  const fetch_ = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/recruiters?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      setRecruiters(data.recruiters || []);
    } finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetch_(); }, [fetch_]);
  useEffect(() => { if (searchParams.get("action") === "new") setDialogOpen(true); }, [searchParams]);

  const handleDelete = async (id: string) => {
    const result = await deleteRecruiter(id);
    if (result.success) { toast.success("Recruiter deleted"); fetch_(); }
    else toast.error(result.error);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Recruiters</h1>
          <p className="text-sm text-muted-foreground">{recruiters.length} contacts</p>
        </div>
        <Button size="sm" onClick={() => setDialogOpen(true)} className="gap-1.5">
          <Plus className="h-4 w-4" /> Add Recruiter
        </Button>
      </div>

      <Input placeholder="Search recruiters..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({length:6}).map((_,i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
        </div>
      ) : recruiters.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Users className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <div><p className="font-semibold">No recruiters yet</p><p className="text-sm text-muted-foreground">Start adding your recruiter contacts</p></div>
          <Button onClick={() => setDialogOpen(true)} className="gap-2"><Plus className="h-4 w-4" /> Add Recruiter</Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {recruiters.map((rec) => (
            <Card key={rec.id} className="hover:shadow-sm transition-all group">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback style={{ backgroundColor: generateColor(rec.name) }} className="text-white text-sm font-semibold">
                        {getInitials(rec.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm">{rec.name}</p>
                      <p className="text-xs text-muted-foreground">{rec.title}{rec.company ? ` @ ${rec.company}` : ""}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditRec(rec)}><Edit className="mr-2 h-3.5 w-3.5" /> Edit</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(rec.id)}><Trash2 className="mr-2 h-3.5 w-3.5" /> Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mt-3 space-y-1">
                  {rec.email && (
                    <a href={`mailto:${rec.email}`} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground truncate">
                      <Mail className="h-3 w-3 shrink-0" /> {rec.email}
                    </a>
                  )}
                  {rec.phone && <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Phone className="h-3 w-3" /> {rec.phone}</p>}
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">{rec.type.replace(/_/g," ")}</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                    <span className="text-xs font-medium">{rec.relationshipScore}</span>
                  </div>
                </div>

                {rec.lastContactDate && (
                  <p className="mt-2 text-[10px] text-muted-foreground/60">Last contact: {formatDate(rec.lastContactDate)}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Add Recruiter</DialogTitle></DialogHeader>
          <RecruiterForm onSuccess={() => { setDialogOpen(false); fetch_(); }} onCancel={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      {editRec && (
        <Dialog open={!!editRec} onOpenChange={() => setEditRec(null)}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Edit Recruiter</DialogTitle></DialogHeader>
            <RecruiterForm recruiter={editRec} onSuccess={() => { setEditRec(null); fetch_(); }} onCancel={() => setEditRec(null)} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
