"use client";
// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { toast } from "sonner";
import { User, Briefcase, MapPin, Globe, Code, Link2 } from "lucide-react";

export default function ProfilePage() {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    name: "", email: "", title: "", location: "", bio: "",
    linkedinUrl: "", githubUrl: "", portfolioUrl: "",
    targetRole: "", targetSalaryMin: "", targetSalaryMax: "",
  });

  useEffect(() => {
    fetch("/api/profile")
      .then(r => r.json())
      .then(data => { if (data.user) setProfile({ ...profile, ...data.user, targetSalaryMin: data.user.targetSalaryMin || "", targetSalaryMax: data.user.targetSalaryMax || "" }); });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...profile,
          targetSalaryMin: profile.targetSalaryMin ? parseInt(profile.targetSalaryMin) : null,
          targetSalaryMax: profile.targetSalaryMax ? parseInt(profile.targetSalaryMax) : null,
        }),
      });
      if (res.ok) toast.success("Profile updated");
      else toast.error("Failed to update profile");
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your personal information</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg font-bold gradient-brand text-white">
                {profile.name ? getInitials(profile.name) : "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{profile.name || "Your Name"}</p>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Full Name</Label>
                <Input value={profile.name} onChange={e => setProfile(p => ({...p, name: e.target.value}))} placeholder="Your name" />
              </div>
              <div className="space-y-1.5">
                <Label>Current Title</Label>
                <Input value={profile.title} onChange={e => setProfile(p => ({...p, title: e.target.value}))} placeholder="Software Engineer" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Location</Label>
              <Input value={profile.location} onChange={e => setProfile(p => ({...p, location: e.target.value}))} placeholder="San Francisco, CA" />
            </div>
            <div className="space-y-1.5">
              <Label>Bio</Label>
              <Textarea value={profile.bio} onChange={e => setProfile(p => ({...p, bio: e.target.value}))} placeholder="Brief professional summary..." rows={3} />
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-semibold mb-3">Job Search Preferences</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Target Role</Label>
                  <Input value={profile.targetRole} onChange={e => setProfile(p => ({...p, targetRole: e.target.value}))} placeholder="Senior Engineer" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label>Salary Min</Label>
                    <Input type="number" value={profile.targetSalaryMin} onChange={e => setProfile(p => ({...p, targetSalaryMin: e.target.value}))} placeholder="100000" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Salary Max</Label>
                    <Input type="number" value={profile.targetSalaryMax} onChange={e => setProfile(p => ({...p, targetSalaryMax: e.target.value}))} placeholder="180000" />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-semibold mb-3">Social Links</p>
              <div className="space-y-3">
                {[
                  { key: "linkedinUrl", icon: Link2, placeholder: "https://linkedin.com/in/you" },
                  { key: "githubUrl", icon: Code, placeholder: "https://github.com/you" },
                  { key: "portfolioUrl", icon: Globe, placeholder: "https://yoursite.com" },
                ].map(({ key, icon: Icon, placeholder }) => (
                  <div key={key} className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <Input
                      value={(profile as any)[key]}
                      onChange={e => setProfile(p => ({...p, [key]: e.target.value}))}
                      placeholder={placeholder}
                    />
                  </div>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full" loading={loading}>Save Profile</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
