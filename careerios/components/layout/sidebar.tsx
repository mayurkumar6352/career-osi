"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Briefcase, CalendarCheck, Users, Network,
  Gift, BarChart3, CheckSquare, Settings, ChevronLeft,
  ChevronRight, Sparkles, Zap, LogOut, User, Bell
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { createBrowserSupabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Applications", href: "/dashboard/applications", icon: Briefcase },
  { label: "Interviews", href: "/dashboard/interviews", icon: CalendarCheck },
  { label: "Recruiters", href: "/dashboard/recruiters", icon: Users },
  { label: "Networking", href: "/dashboard/networking", icon: Network },
  { label: "Offers", href: "/dashboard/offers", icon: Gift },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Tasks", href: "/dashboard/tasks", icon: CheckSquare },
];

interface SidebarProps {
  user?: { name?: string | null; email?: string | null; avatarUrl?: string | null };
  tasksDue?: number;
  upcomingInterviews?: number;
}

export function Sidebar({ user, tasksDue = 0, upcomingInterviews = 0 }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createBrowserSupabase();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    toast.success("Signed out");
  };

  const getBadge = (href: string) => {
    if (href === "/dashboard/interviews" && upcomingInterviews > 0) return upcomingInterviews;
    if (href === "/dashboard/tasks" && tasksDue > 0) return tasksDue;
    return null;
  };

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        animate={{ width: collapsed ? 64 : 240 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="relative flex h-screen flex-col border-r bg-sidebar"
      >
        {/* Logo */}
        <div className={cn("flex h-14 items-center border-b border-sidebar-border px-4", collapsed ? "justify-center" : "justify-between")}>
          <AnimatePresence mode="wait">
            {!collapsed ? (
              <motion.div key="full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg gradient-brand">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-bold text-sidebar-foreground">CareerOS</span>
              </motion.div>
            ) : (
              <motion.div key="icon" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg gradient-brand">
                  <Zap className="h-4 w-4 text-white" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Collapse Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-16 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-sidebar-border bg-sidebar text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1 scrollbar-hide">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const badge = getBadge(item.href);

            const content = (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-150",
                  collapsed ? "justify-center" : "",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className={cn("h-4 w-4 shrink-0", isActive && "text-sidebar-primary")} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }} exit={{ opacity: 0, width: 0 }} className="overflow-hidden whitespace-nowrap">
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {!collapsed && badge && (
                  <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{content}</TooltipTrigger>
                  <TooltipContent side="right" className="flex items-center gap-2">
                    {item.label}
                    {badge && <Badge className="h-4 px-1 text-[10px]">{badge}</Badge>}
                  </TooltipContent>
                </Tooltip>
              );
            }
            return content;
          })}

          <div className="my-2 border-t border-sidebar-border" />

          {/* AI Features */}
          {[
            { label: "AI Copilot", href: "/dashboard/applications?tab=ai", icon: Sparkles },
            { label: "Settings", href: "/dashboard/settings", icon: Settings },
          ].map((item) => {
            const isActive = pathname === item.href;
            const content = (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
                  collapsed ? "justify-center" : "",
                  isActive ? "bg-sidebar-accent text-sidebar-primary" : "text-sidebar-foreground hover:bg-sidebar-accent"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
            if (collapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{content}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              );
            }
            return content;
          })}
        </nav>

        {/* User Area */}
        <div className="border-t border-sidebar-border p-3">
          <div className={cn("flex items-center gap-2", collapsed ? "justify-center" : "")}>
            <Link href="/dashboard/profile">
              <Avatar className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-sidebar-primary transition-all">
                <AvatarImage src={user?.avatarUrl || ""} alt={user?.name || ""} />
                <AvatarFallback className="bg-sidebar-accent text-sidebar-foreground text-xs">
                  {user?.name ? user.name[0].toUpperCase() : "U"}
                </AvatarFallback>
              </Avatar>
            </Link>
            <AnimatePresence>
              {!collapsed && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-1 flex-col overflow-hidden">
                  <span className="truncate text-xs font-medium text-sidebar-foreground">{user?.name || "User"}</span>
                  <span className="truncate text-[10px] text-sidebar-foreground/50">{user?.email}</span>
                </motion.div>
              )}
            </AnimatePresence>
            {!collapsed && (
              <button
                onClick={handleSignOut}
                className="rounded p-1 text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                title="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </motion.aside>
    </TooltipProvider>
  );
}
