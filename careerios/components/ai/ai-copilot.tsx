"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronRight, Copy, CheckCircle, Loader2, Brain, Target, Mail, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  generateInterviewQuestions,
  generateFollowUpEmail,
  analyzeResumeMatch,
  generateSTARAnswer,
} from "@/lib/actions/ai.actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type AIFeature = "interview-questions" | "follow-up-email" | "resume-match" | "star-answer";

interface AICopilotProps {
  company?: string;
  jobTitle?: string;
  jobDescription?: string;
  userName?: string;
}

export function AICopilot({ company = "", jobTitle = "", jobDescription = "", userName = "there" }: AICopilotProps) {
  const [activeFeature, setActiveFeature] = useState<AIFeature | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState<string | null>(null);

  // Form state
  const [interviewType, setInterviewType] = useState("TECHNICAL");
  const [emailType, setEmailType] = useState<any>("thank_you");
  const [recipientName, setRecipientName] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [starQuestion, setStarQuestion] = useState("");
  const [starContext, setStarContext] = useState("");

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleGenerate = async () => {
    setLoading(true);
    setResult(null);
    try {
      let res;
      switch (activeFeature) {
        case "interview-questions":
          res = await generateInterviewQuestions({ company, jobTitle, type: interviewType, jobDescription });
          break;
        case "follow-up-email":
          res = await generateFollowUpEmail({ type: emailType, recipientName, company, jobTitle, userName });
          break;
        case "resume-match":
          res = await analyzeResumeMatch({ resumeText, jobDescription, jobTitle });
          break;
        case "star-answer":
          res = await generateSTARAnswer({ question: starQuestion, context: starContext });
          break;
      }
      if (res?.success) setResult(res.data);
      else toast.error(res?.error || "Failed to generate");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { id: "interview-questions" as AIFeature, icon: Brain, label: "Interview Questions", desc: "Generate tailored questions" },
    { id: "follow-up-email" as AIFeature, icon: Mail, label: "Follow-up Email", desc: "Draft professional emails" },
    { id: "resume-match" as AIFeature, icon: Target, label: "Resume Match", desc: "ATS analysis & score" },
    { id: "star-answer" as AIFeature, icon: FileText, label: "STAR Answer", desc: "Behavioral interview answers" },
  ];

  return (
    <div className="space-y-4">
      {/* Feature selector */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {features.map(({ id, icon: Icon, label, desc }) => (
          <button
            key={id}
            onClick={() => { setActiveFeature(id); setResult(null); }}
            className={cn(
              "flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all",
              activeFeature === id ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-muted/50"
            )}
          >
            <Icon className={cn("h-4 w-4", activeFeature === id ? "text-primary" : "text-muted-foreground")} />
            <p className="text-xs font-semibold">{label}</p>
            <p className="text-[10px] text-muted-foreground">{desc}</p>
          </button>
        ))}
      </div>

      {/* Feature-specific inputs */}
      <AnimatePresence mode="wait">
        {activeFeature && (
          <motion.div
            key={activeFeature}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            {activeFeature === "interview-questions" && (
              <div>
                <label className="text-xs font-medium">Interview Type</label>
                <select
                  value={interviewType}
                  onChange={(e) => setInterviewType(e.target.value)}
                  className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  {["TECHNICAL","BEHAVIORAL","SYSTEM_DESIGN","HR","FINAL"].map((t) => (
                    <option key={t} value={t}>{t.replace(/_/g," ")}</option>
                  ))}
                </select>
              </div>
            )}

            {activeFeature === "follow-up-email" && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium">Email Type</label>
                  <select
                    value={emailType}
                    onChange={(e) => setEmailType(e.target.value)}
                    className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="thank_you">Thank-you After Interview</option>
                    <option value="recruiter_followup">Recruiter Follow-up</option>
                    <option value="referral_request">Referral Request</option>
                    <option value="networking">Networking Outreach</option>
                    <option value="interview_followup">Interview Follow-up</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium">Recipient Name</label>
                  <Input
                    placeholder="Sarah, John..."
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            )}

            {activeFeature === "resume-match" && (
              <div>
                <label className="text-xs font-medium">Paste Your Resume</label>
                <Textarea
                  placeholder="Paste your resume text here..."
                  rows={5}
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  className="mt-1"
                />
              </div>
            )}

            {activeFeature === "star-answer" && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium">Behavioral Question</label>
                  <Input
                    placeholder="Tell me about a time you led a team..."
                    value={starQuestion}
                    onChange={(e) => setStarQuestion(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium">Your Context / Experience</label>
                  <Textarea
                    placeholder="Briefly describe your relevant background and experience..."
                    rows={3}
                    value={starContext}
                    onChange={(e) => setStarContext(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            )}

            <Button onClick={handleGenerate} loading={loading} className="gap-2 w-full sm:w-auto">
              <Sparkles className="h-4 w-4" />
              {loading ? "Generating..." : "Generate with AI"}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            {/* Interview Questions */}
            {activeFeature === "interview-questions" && (
              <div className="grid gap-3 sm:grid-cols-2">
                {Object.entries(result).map(([category, questions]) => (
                  <Card key={category}>
                    <CardHeader className="pb-2 pt-4 px-4">
                      <CardTitle className="text-xs font-semibold capitalize text-muted-foreground">
                        {category.replace(/([A-Z])/g, " $1").trim()}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                      <ol className="space-y-1.5">
                        {(questions as string[]).map((q, i) => (
                          <li key={i} className="text-xs flex gap-2">
                            <span className="text-muted-foreground shrink-0 tabular-nums">{i + 1}.</span>
                            <span>{q}</span>
                          </li>
                        ))}
                      </ol>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Follow-up Email */}
            {activeFeature === "follow-up-email" && (
              <Card>
                <CardContent className="pt-4 space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-muted-foreground">SUBJECT</label>
                      <Button variant="ghost" size="icon-sm" onClick={() => copyText(result.subject, "subject")}>
                        {copied === "subject" ? <CheckCircle className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                    <p className="text-sm font-medium">{result.subject}</p>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-muted-foreground">BODY</label>
                      <Button variant="ghost" size="icon-sm" onClick={() => copyText(result.body, "body")}>
                        {copied === "body" ? <CheckCircle className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{result.body}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Resume Match */}
            {activeFeature === "resume-match" && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Match Score", value: result.matchScore, color: result.matchScore >= 70 ? "text-emerald-500" : result.matchScore >= 50 ? "text-orange-500" : "text-red-500" },
                    { label: "ATS Score", value: result.atsScore, color: result.atsScore >= 70 ? "text-emerald-500" : result.atsScore >= 50 ? "text-orange-500" : "text-red-500" },
                  ].map(({ label, value, color }) => (
                    <Card key={label}>
                      <CardContent className="pt-4 text-center">
                        <p className={cn("text-3xl font-bold tabular-nums", color)}>{value}%</p>
                        <p className="text-xs text-muted-foreground mt-1">{label}</p>
                        <Progress value={value} className="mt-2 h-1.5" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <Card>
                  <CardContent className="pt-4 space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1.5">✓ Matching Skills</p>
                      <div className="flex flex-wrap gap-1.5">
                        {result.skillOverlap?.map((s: string) => (
                          <Badge key={s} variant="success" className="text-[10px]">{s}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-red-500 dark:text-red-400 mb-1.5">✗ Missing Skills</p>
                      <div className="flex flex-wrap gap-1.5">
                        {result.missingSkills?.map((s: string) => (
                          <Badge key={s} variant="destructive" className="text-[10px] opacity-80">{s}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1.5">Suggestions</p>
                      <ul className="space-y-1">
                        {result.suggestions?.map((s: string, i: number) => (
                          <li key={i} className="text-xs flex gap-2">
                            <ChevronRight className="h-3 w-3 text-primary shrink-0 mt-0.5" />{s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* STAR Answer */}
            {activeFeature === "star-answer" && (
              <Card>
                <CardContent className="pt-4 space-y-3">
                  {["situation","task","action","result"].map((key) => (
                    <div key={key} className="border-b last:border-b-0 pb-3 last:pb-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-1">{key}</p>
                      <p className="text-sm">{result[key]}</p>
                    </div>
                  ))}
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-muted-foreground">FULL ANSWER</p>
                      <Button variant="ghost" size="sm" onClick={() => copyText(result.fullAnswer, "star")} className="h-7 gap-1.5 text-xs">
                        {copied === "star" ? <CheckCircle className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                        Copy
                      </Button>
                    </div>
                    <p className="text-sm bg-muted/50 rounded-lg p-3">{result.fullAnswer}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
