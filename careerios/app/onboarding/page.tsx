"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const STEPS = ["Welcome", "Your Info", "Job Preferences", "All Set"];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    name: "", title: "", location: "",
    targetRole: "", targetSalaryMin: "", targetSalaryMax: "",
    targetIndustry: "",
  });
  const router = useRouter();

  const handleFinish = async () => {
    setLoading(true);
    try {
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          targetSalaryMin: data.targetSalaryMin ? parseInt(data.targetSalaryMin) : null,
          targetSalaryMax: data.targetSalaryMax ? parseInt(data.targetSalaryMax) : null,
          onboardingDone: true,
        }),
      });
      toast.success("Welcome to CareerOS! 🚀");
      router.push("/dashboard");
    } finally { setLoading(false); }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-brand shadow-lg">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">CareerOS</h1>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all
                ${i < step ? "bg-primary text-white" : i === step ? "bg-primary text-white ring-4 ring-primary/20" : "bg-muted text-muted-foreground"}`}>
                {i < step ? <CheckCircle className="h-4 w-4" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 w-8 transition-all ${i < step ? "bg-primary" : "bg-muted"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
              {step === 0 && (
                <div className="text-center space-y-3 py-4">
                  <div className="text-5xl">👋</div>
                  <h2 className="text-xl font-bold">Welcome to CareerOS</h2>
                  <p className="text-muted-foreground text-sm">Your career command center. Track applications, manage interviews, and land your dream job.</p>
                  <div className="grid grid-cols-2 gap-3 pt-2 text-left">
                    {["📋 Application Pipeline", "🎯 Interview CRM", "🤝 Networking Hub", "🤖 AI Copilot"].map(f => (
                      <div key={f} className="flex items-center gap-2 rounded-lg bg-muted/50 p-2.5 text-xs font-medium">{f}</div>
                    ))}
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-bold">About you</h2>
                  <div className="space-y-1.5">
                    <Label>Full Name</Label>
                    <Input placeholder="Jane Smith" value={data.name} onChange={e => setData(p => ({...p, name: e.target.value}))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Current / Most Recent Title</Label>
                    <Input placeholder="Software Engineer" value={data.title} onChange={e => setData(p => ({...p, title: e.target.value}))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Location</Label>
                    <Input placeholder="San Francisco, CA" value={data.location} onChange={e => setData(p => ({...p, location: e.target.value}))} />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-bold">Job Preferences</h2>
                  <div className="space-y-1.5">
                    <Label>Target Role</Label>
                    <Input placeholder="Senior Software Engineer" value={data.targetRole} onChange={e => setData(p => ({...p, targetRole: e.target.value}))} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Min Salary (USD)</Label>
                      <Input type="number" placeholder="100000" value={data.targetSalaryMin} onChange={e => setData(p => ({...p, targetSalaryMin: e.target.value}))} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Max Salary (USD)</Label>
                      <Input type="number" placeholder="180000" value={data.targetSalaryMax} onChange={e => setData(p => ({...p, targetSalaryMax: e.target.value}))} />
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="text-center space-y-3 py-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 mx-auto">
                    <CheckCircle className="h-8 w-8 text-emerald-500" />
                  </div>
                  <h2 className="text-xl font-bold">You're all set!</h2>
                  <p className="text-sm text-muted-foreground">CareerOS is ready. Start by adding your first job application.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between mt-6 pt-4 border-t">
            <Button variant="ghost" onClick={() => setStep(s => s - 1)} disabled={step === 0} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button onClick={() => setStep(s => s + 1)} className="gap-2">
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleFinish} loading={loading} className="gap-2">
                Launch CareerOS <Zap className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
