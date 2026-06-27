"use client";
import React, { useEffect, useState } from "react";
import { Bell, X, Calendar, CheckSquare, AlertCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatRelative } from "@/lib/utils";
import type { Notification } from "@/types";

interface NotificationPanelProps {
  onClose: () => void;
}

export function NotificationPanel({ onClose }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => setNotifications(data.notifications || []))
      .finally(() => setLoading(false));
  }, []);

  const markRead = async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "INTERVIEW_REMINDER": return <Calendar className="h-4 w-4 text-blue-500" />;
      case "TASK_DUE": return <CheckSquare className="h-4 w-4 text-orange-500" />;
      case "OFFER_EXPIRING": return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Zap className="h-4 w-4 text-purple-500" />;
    }
  };

  return (
    <div className="w-80 rounded-xl border bg-popover shadow-lg">
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4" />
          <span className="font-semibold text-sm">Notifications</span>
          {notifications.filter((n) => !n.read).length > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-white font-bold">
              {notifications.filter((n) => !n.read).length}
            </span>
          )}
        </div>
        <Button variant="ghost" size="icon-sm" onClick={onClose}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
      <ScrollArea className="max-h-80">
        {loading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-3/4 rounded bg-muted animate-pulse" />
                  <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <Bell className="h-8 w-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">You're all caught up!</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => markRead(n.id)}
                className={`flex gap-3 rounded-lg p-3 cursor-pointer transition-colors hover:bg-muted ${!n.read ? "bg-primary/5" : ""}`}
              >
                <div className="mt-0.5">{getIcon(n.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!n.read ? "font-medium" : ""}`}>{n.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{n.message}</p>
                  <p className="text-xs text-muted-foreground/50 mt-0.5">{formatRelative(n.createdAt)}</p>
                </div>
                {!n.read && <div className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
