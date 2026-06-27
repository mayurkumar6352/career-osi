"use client";
import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatSalary } from "@/lib/utils";
import { CheckCircle, XCircle, Trophy } from "lucide-react";
import type { Offer } from "@/types";

interface OfferComparisonProps {
  offers: Offer[];
}

function scoreOffer(offer: Offer): number {
  let score = 0;
  score += Math.min(offer.baseSalary / 2000, 40);
  if (offer.bonus) score += Math.min(offer.bonus / 500, 15);
  if (offer.equity) score += Math.min(offer.equity * 2, 15);
  if (offer.signingBonus) score += Math.min(offer.signingBonus / 500, 10);
  if (offer.healthInsurance) score += 5;
  if (offer.dentalVision) score += 3;
  if (offer.retirement401k) score += 5;
  if (offer.ptodays) score += Math.min(offer.ptodays / 5, 7);
  return Math.round(Math.min(score, 100));
}

export function OfferComparison({ offers }: OfferComparisonProps) {
  if (offers.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <Trophy className="h-10 w-10 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">Add offers to compare them</p>
      </div>
    );
  }

  const scored = offers.map((o) => ({ ...o, score: scoreOffer(o) })).sort((a, b) => b.score - a.score);
  const maxSalary = Math.max(...scored.map((o) => o.baseSalary));

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {scored.map((offer, index) => (
          <motion.div key={offer.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
            <Card className={index === 0 ? "border-primary ring-1 ring-primary" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-sm">{offer.company}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">{offer.jobTitle}</p>
                  </div>
                  {index === 0 && (
                    <Badge className="gap-1 text-[10px]">
                      <Trophy className="h-2.5 w-2.5" /> Best
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {formatSalary(offer.baseSalary, offer.currency)}
                  </p>
                  <p className="text-xs text-muted-foreground">Base Salary</p>
                  <Progress value={(offer.baseSalary / maxSalary) * 100} className="mt-1.5 h-1.5" />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {offer.bonus && (
                    <div className="rounded-lg bg-muted/50 p-2">
                      <p className="text-muted-foreground">Bonus</p>
                      <p className="font-semibold">{formatSalary(offer.bonus, offer.currency)}</p>
                    </div>
                  )}
                  {offer.signingBonus && (
                    <div className="rounded-lg bg-muted/50 p-2">
                      <p className="text-muted-foreground">Signing</p>
                      <p className="font-semibold">{formatSalary(offer.signingBonus, offer.currency)}</p>
                    </div>
                  )}
                  {offer.equity && (
                    <div className="rounded-lg bg-muted/50 p-2">
                      <p className="text-muted-foreground">Equity</p>
                      <p className="font-semibold">{offer.equity}%</p>
                    </div>
                  )}
                  {offer.ptodays && (
                    <div className="rounded-lg bg-muted/50 p-2">
                      <p className="text-muted-foreground">PTO Days</p>
                      <p className="font-semibold">{offer.ptodays}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  {[
                    { label: "Health Insurance", value: offer.healthInsurance },
                    { label: "Dental/Vision", value: offer.dentalVision },
                    { label: "401(k)", value: offer.retirement401k },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center gap-2">
                      {value
                        ? <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        : <XCircle className="h-3.5 w-3.5 text-muted-foreground/30 shrink-0" />
                      }
                      <span className={`text-xs ${value ? "" : "text-muted-foreground/60"}`}>{label}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium">Overall Score</span>
                    <span className={`text-sm font-bold tabular-nums ${index === 0 ? "text-primary" : ""}`}>{offer.score}/100</span>
                  </div>
                  <Progress value={offer.score} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
