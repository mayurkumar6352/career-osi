// @ts-nocheck
"use client";
// @ts-ignore
"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Network, Mail, Link2, MoreHorizontal, Trash2, Edit, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { NetworkingContactSchema, type NetworkingContactInput } from "@/lib/validators/networking";
import { createNetworkingContact, updateNetworkingContact, deleteNetworkingContact } from "@/lib/actions/networking.actions";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getInitials, generateColor, formatDate, cn } from "@/lib/utils";
import { toast } from "sonner";
import type { NetworkingContact } from "@prisma/client";

const HEALTH_COLORS: Record<string, string> = {
  HOT: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  WARM: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
  COLD: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  INACTIVE: "bg-muted text-muted-foreground",
};

function ContactForm({ contact, onSuccess, onCancel }: { contact?: NetworkingContact; onSuccess?: () => void; onCancel?: () => void }) {
  const [loading, setLoading] = useState(false);
  const form = useForm<NetworkingContactInput>({
    resolver: zodResolver(NetworkingContactSchema),
    defaultValues: {
      name: contact?.name || "",
      email: contact?.email || "",
      phone: contact?.phone || "",
      title: contact?.title || "",
      company: contact?.company || "",
      linkedinUrl: contact?.linkedinUrl || "",
      type: contact?.type || "CONNECTION",
      relationshipHealth: contact?.relationshipHealth || "WARM",
      notes: contact?.notes || "",
      tags: contact?.tags || [],
    },
  });

  const onSubmit = async (data: NetworkingContactInput) => {
    setLoading(true);
    try {
      const result = contact ? await updateNetworkingContact(contact.id, data) : await createNetworkingContact(data);
      if (result.success) { toast.success(contact ? "Contact updated" : "Contact added"); onSuccess?.(); }
      else toast.error(result.error);
    } finally { setLoading(false); }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem><FormLabel>Name *</FormLabel><FormControl><Input placeholder="Jane Smith" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="type" render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  {["CONNECTION","ALUMNI","MENTOR","REFERRAL","COLLEAGUE","FRIEND"].map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="company" render={({ field }) => (
            <FormItem><FormLabel>Company</FormLabel><FormControl><Input placeholder="Company name" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="title" render={({ field }) => (
            <FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="Software Engineer" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="relationshipHealth" render={({ field }) => (
            <FormItem>
              <FormLabel>Relationship</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="HOT">🔥 Hot</SelectItem>
                  <SelectItem value="WARM">☀️ Warm</SelectItem>
                  <SelectItem value="COLD">❄️ Cold</SelectItem>
                  <SelectItem value="INACTIVE">💤 Inactive</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <FormField control={form.control} name="linkedinUrl" render={({ field }) => (
          <FormItem><FormLabel>LinkedIn</FormLabel><FormControl><Input placeholder="https://linkedin.com/in/..." {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="notes" render={({ field }) => (
          <FormItem><FormLabel>Notes</FormLabel><FormControl><Textarea rows={3} {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <div className="flex justify-end gap-3">
          {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
          <Button type="submit" loading={loading}>{contact ? "Save Changes" : "Add Contact"}</Button>
        </div>
      </form>
    </Form>
  );
}

export default function NetworkingPage() {
  const [contacts, setContacts] = useState<NetworkingContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editContact, setEditContact] = useState<NetworkingContact | null>(null);
  const searchParams = useSearchParams();

  const fetch_ = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/networking?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      setContacts(data.contacts || []);
    } finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetch_(); }, [fetch_]);
  useEffect(() => { if (searchParams.get("action") === "new") setDialogOpen(true); }, [searchParams]);

  const handleDelete = async (id: string) => {
    const result = await deleteNetworkingContact(id);
    if (result.success) { toast.success("Contact deleted"); fetch_(); }
    else toast.error(result.error);
  };

  const grouped = contacts.reduce((acc, c) => {
    acc[c.type] = [...(acc[c.type] || []), c];
    return acc;
  }, {} as Record<string, NetworkingContact[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Networking</h1>
          <p className="text-sm text-muted-foreground">{contacts.length} connections</p>
        </div>
        <Button size="sm" onClick={() => setDialogOpen(true)} className="gap-1.5">
          <Plus className="h-4 w-4" /> Add Contact
        </Button>
      </div>

      <Input placeholder="Search contacts..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({length:6}).map((_,i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
        </div>
      ) : contacts.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Network className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <div><p className="font-semibold">No contacts yet</p><p className="text-sm text-muted-foreground">Build your professional network</p></div>
          <Button onClick={() => setDialogOpen(true)} className="gap-2"><Plus className="h-4 w-4" /> Add Contact</Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {contacts.map((contact) => (
            <Card key={contact.id} className="hover:shadow-sm transition-all group">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback style={{ backgroundColor: generateColor(contact.name) }} className="text-white text-sm font-semibold">
                        {getInitials(contact.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm">{contact.name}</p>
                      <p className="text-xs text-muted-foreground">{contact.title}{contact.company ? ` @ ${contact.company}` : ""}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditContact(contact)}><Edit className="mr-2 h-3.5 w-3.5" /> Edit</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(contact.id)}><Trash2 className="mr-2 h-3.5 w-3.5" /> Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  {contact.email && (
                    <a href={`mailto:${contact.email}`} className="flex h-7 w-7 items-center justify-center rounded-md bg-muted hover:bg-muted/80 transition-colors">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    </a>
                  )}
                  {contact.linkedinUrl && (
                    <a href={contact.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex h-7 w-7 items-center justify-center rounded-md bg-muted hover:bg-muted/80 transition-colors">
                      <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
                    </a>
                  )}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MessageSquare className="h-3 w-3" /> {contact.messagesSent} sent
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{contact.type}</span>
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", HEALTH_COLORS[contact.relationshipHealth])}>
                    {contact.relationshipHealth}
                  </span>
                </div>

                {contact.lastContactDate && (
                  <p className="mt-2 text-[10px] text-muted-foreground/60">Last contact: {formatDate(contact.lastContactDate)}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Add Contact</DialogTitle></DialogHeader>
          <ContactForm onSuccess={() => { setDialogOpen(false); fetch_(); }} onCancel={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      {editContact && (
        <Dialog open={!!editContact} onOpenChange={() => setEditContact(null)}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Edit Contact</DialogTitle></DialogHeader>
            <ContactForm contact={editContact} onSuccess={() => { setEditContact(null); fetch_(); }} onCancel={() => setEditContact(null)} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
