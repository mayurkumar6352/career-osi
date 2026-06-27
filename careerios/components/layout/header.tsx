"use client";
import React, { useState, useEffect } from "react";
import { Search, Bell, Moon, Sun, Plus, Command } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CommandPalette } from "@/components/layout/command-palette";
import { NotificationPanel } from "@/components/layout/notification-panel";

interface HeaderProps {
  title?: string;
  notificationCount?: number;
}

export function Header({ title, notificationCount = 0 }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [commandOpen, setCommandOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen(true);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <header className="flex h-14 items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
        <div className="flex items-center gap-3">
          {title && <h1 className="text-lg font-semibold">{title}</h1>}
        </div>

        <div className="flex items-center gap-2">
          {/* Search / Command */}
          <button
            onClick={() => setCommandOpen(true)}
            className="flex h-9 w-64 items-center gap-2 rounded-md border border-input bg-muted/50 px-3 text-sm text-muted-foreground hover:bg-muted transition-colors"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="flex-1 text-left">Search everything...</span>
            <kbd className="flex h-5 items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] text-muted-foreground">
              <span>⌘</span>K
            </kbd>
          </button>

          {/* Notifications */}
          <div className="relative">
            <Button variant="ghost" size="icon" onClick={() => setNotifOpen(!notifOpen)} className="relative">
              <Bell className="h-4 w-4" />
              {notificationCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                  {notificationCount > 9 ? "9+" : notificationCount}
                </span>
              )}
            </Button>
            {notifOpen && (
              <div className="absolute right-0 top-full z-50 mt-2">
                <NotificationPanel onClose={() => setNotifOpen(false)} />
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          {mounted && (
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </header>

      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </>
  );
}
