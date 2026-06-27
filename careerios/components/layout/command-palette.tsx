"use client";
import React, { useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog, CommandEmpty, CommandGroup,
  CommandInput, CommandItem, CommandList, CommandSeparator
} from "@/components/ui/command";
import {
  LayoutDashboard, Briefcase, CalendarCheck, Users,
  Network, Gift, BarChart3, CheckSquare, Plus,
  Settings, User, Sparkles, FileText
} from "lucide-react";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();

  const runCommand = useCallback((cmd: () => void) => {
    onOpenChange(false);
    cmd();
  }, [onOpenChange]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search or jump to..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          {[
            { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
            { icon: Briefcase, label: "Applications", href: "/dashboard/applications" },
            { icon: CalendarCheck, label: "Interviews", href: "/dashboard/interviews" },
            { icon: Users, label: "Recruiters", href: "/dashboard/recruiters" },
            { icon: Network, label: "Networking", href: "/dashboard/networking" },
            { icon: Gift, label: "Offers", href: "/dashboard/offers" },
            { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
            { icon: CheckSquare, label: "Tasks", href: "/dashboard/tasks" },
          ].map(({ icon: Icon, label, href }) => (
            <CommandItem key={href} onSelect={() => runCommand(() => router.push(href))}>
              <Icon className="mr-2 h-4 w-4" />
              {label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Quick Actions">
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/applications?action=new"))}>
            <Plus className="mr-2 h-4 w-4" /> Add Application
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/interviews?action=new"))}>
            <Plus className="mr-2 h-4 w-4" /> Schedule Interview
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/recruiters?action=new"))}>
            <Plus className="mr-2 h-4 w-4" /> Add Recruiter
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/networking?action=new"))}>
            <Plus className="mr-2 h-4 w-4" /> Add Contact
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/tasks?action=new"))}>
            <Plus className="mr-2 h-4 w-4" /> Create Task
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/offers?action=new"))}>
            <Plus className="mr-2 h-4 w-4" /> Add Offer
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Account">
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/profile"))}>
            <User className="mr-2 h-4 w-4" /> Profile
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/settings"))}>
            <Settings className="mr-2 h-4 w-4" /> Settings
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
