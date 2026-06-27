// @ts-nocheck
"use client";
// @ts-ignore
"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Gift, MoreHorizontal, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { OfferSchema, type OfferInput } from "@/lib/validators/offer";
import { createOffer, updateOffer, deleteOffer } from "@/lib/actions/offer.actions";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OfferComparison } from "@/components/offers/offer-comparison";
import { formatSalary, formatDate, cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Offer } from "@prisma/client";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  ACCEPTED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  DECLINED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  NEGOTIATING: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  EXPIRED: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  RESCINDED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

function OfferForm({ offer, onSuccess, onCancel }: { offer?: Offer; onSuccess?: () => void; onCancel?: () => void }) {
  const [loading, setLoading] = useState(false);
  const form = useForm<OfferInput>({
    resolver: zodResolver(OfferSchema),
    defaultValues: {
      company: offer?.company || "",
      jobTitle: offer?.jobTitle || "",
      status: offer?.status || "PENDING",
      baseSalary: offer?.baseSalary || 0,
      currency: offer?.currency || "USD",
      bonus: offer?.bonus || undefined,
      equity: offer?.equity || undefined,
      signingBonus: offer?.signingBonus || undefined,
      ptodays: offer?.ptodays || undefined,
      healthInsurance: offer?.healthInsurance || false,
      dentalVision: offer?.dentalVision || false,
      retirement401k: offer?.retirement401k || false,
      notes: offer?.notes || "",
    },
  });

  const onSubmit = async (data: OfferInput) => {
    setLoading(true);
    try {
      const result = offer ? await updateOffer(offer.id, data) : await createOffer(data);
      if (result.success) { toast.success(offer ? "Offer updated" : "Offer added"); onSuccess?.(); }
      else toast.error(result.error);
    } finally { setLoading(false); }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="company" render={({ field }) => (
            <FormItem><FormLabel>Company *</FormLabel><FormControl><Input placeholder="Stripe..." {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="jobTitle" render={({ field }) => (
            <FormItem><FormLabel>Role *</FormLabel><FormControl><Input placeholder="Software Engineer" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <FormField control={form.control} name="baseSalary" render={({ field }) => (
            <FormItem><FormLabel>Base Salary *</FormLabel><FormControl><Input type="number" placeholder="120000" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="bonus" render={({ field }) => (
            <FormItem><FormLabel>Bonus</FormLabel><FormControl><Input type="number" placeholder="20000" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="signingBonus" render={({ field }) => (
            <FormItem><FormLabel>Sign-on Bonus</FormLabel><FormControl><Input type="number" placeholder="10000" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <FormField control={form.control} name="equity" render={({ field }) => (
            <FormItem><FormLabel>Equity %</FormLabel><FormControl><Input type="number" step="0.01" placeholder="0.5" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="ptodays" render={({ field }) => (
            <FormItem><FormLabel>PTO Days</FormLabel><FormControl><Input type="number" placeholder="20" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="status" render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  {["PENDING","ACCEPTED","DECLINED","NEGOTIATING","EXPIRED","RESCINDED"].map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <div className="flex gap-6">
          {[
            { name: "healthInsurance" as const, label: "Health Insurance" },
            { name: "dentalVision" as const, label: "Dental/Vision" },
            { name: "retirement401k" as const, label: "401(k)" },
          ].map(({ name, label }) => (
            <FormField key={name} control={form.control} name={name} render={({ field }) => (
              <FormItem className="flex items-center gap-2 space-y-0">
                <FormControl>
                  <input type="checkbox" checked={field.value as boolean} onChange={field.onChange} className="h-4 w-4 rounded border accent-primary" />
                </FormControl>
                <FormLabel className="font-normal cursor-pointer">{label}</FormLabel>
              </FormItem>
            )} />
          ))}
        </div>
        <FormField control={form.control} name="notes" render={({ field }) => (
          <FormItem><FormLabel>Notes</FormLabel><FormControl><Textarea rows={2} {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <div className="flex justify-end gap-3">
          {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
          <Button type="submit" loading={loading}>{offer ? "Save Changes" : "Add Offer"}</Button>
        </div>
      </form>
    </Form>
  );
}

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editOffer, setEditOffer] = useState<Offer | null>(null);
  const searchParams = useSearchParams();

  const fetch_ = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/offers");
      const data = await res.json();
      setOffers(data.offers || []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);
  useEffect(() => { if (searchParams.get("action") === "new") setDialogOpen(true); }, [searchParams]);

  const handleDelete = async (id: string) => {
    const result = await deleteOffer(id);
    if (result.success) { toast.success("Offer deleted"); fetch_(); }
    else toast.error(result.error);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Offers</h1>
          <p className="text-sm text-muted-foreground">{offers.length} offers</p>
        </div>
        <Button size="sm" onClick={() => setDialogOpen(true)} className="gap-1.5">
          <Plus className="h-4 w-4" /> Add Offer
        </Button>
      </div>

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">All Offers</TabsTrigger>
          <TabsTrigger value="compare">Compare</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-4">
          {loading ? (
            <div className="space-y-3">{Array.from({length:3}).map((_,i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}</div>
          ) : offers.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Gift className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <div><p className="font-semibold">No offers yet</p><p className="text-sm text-muted-foreground">Track your job offers and compare them</p></div>
              <Button onClick={() => setDialogOpen(true)} className="gap-2"><Plus className="h-4 w-4" /> Add Offer</Button>
            </div>
          ) : (
            <div className="space-y-3">
              {offers.map((offer) => (
                <Card key={offer.id} className="hover:shadow-sm transition-all group">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{offer.company}</p>
                        <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold", STATUS_COLORS[offer.status])}>
                          {offer.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{offer.jobTitle}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {formatSalary(offer.baseSalary, offer.currency)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {offer.bonus ? `+${formatSalary(offer.bonus, offer.currency)} bonus` : "Base salary"}
                      </p>
                    </div>
                    {offer.expiryDate && (
                      <div className="text-right shrink-0">
                        <p className="text-xs text-muted-foreground">Expires</p>
                        <p className="text-xs font-medium">{formatDate(offer.expiryDate)}</p>
                      </div>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditOffer(offer)}><Edit className="mr-2 h-3.5 w-3.5" /> Edit</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(offer.id)}><Trash2 className="mr-2 h-3.5 w-3.5" /> Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="compare" className="mt-4">
          <OfferComparison offers={offers.filter(o => o.status !== "DECLINED" && o.status !== "EXPIRED")} />
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Add Offer</DialogTitle></DialogHeader>
          <OfferForm onSuccess={() => { setDialogOpen(false); fetch_(); }} onCancel={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      {editOffer && (
        <Dialog open={!!editOffer} onOpenChange={() => setEditOffer(null)}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Edit Offer</DialogTitle></DialogHeader>
            <OfferForm offer={editOffer} onSuccess={() => { setEditOffer(null); fetch_(); }} onCancel={() => setEditOffer(null)} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
