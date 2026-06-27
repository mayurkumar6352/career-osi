import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isToday, isYesterday, isTomorrow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  if (isTomorrow(d)) return "Tomorrow";
  return format(d, "MMM d, yyyy");
}

export function formatDatetime(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "MMM d, yyyy 'at' h:mm a");
}

export function formatRelative(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function formatSalary(amount: number | null | undefined, currency = "USD"): string {
  if (!amount) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatSalaryRange(min?: number | null, max?: number | null, currency = "USD"): string {
  if (!min && !max) return "Not specified";
  if (min && max) return `${formatSalary(min, currency)} – ${formatSalary(max, currency)}`;
  if (min) return `From ${formatSalary(min, currency)}`;
  return `Up to ${formatSalary(max!, currency)}`;
}

export function formatPercentage(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return `${Math.round(value)}%`;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "…";
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function generateColor(str: string): string {
  const colors = [
    "#6366f1", "#8b5cf6", "#ec4899", "#ef4444", "#f97316",
    "#eab308", "#22c55e", "#14b8a6", "#06b6d4", "#3b82f6",
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function daysUntil(date: Date | string): number {
  const target = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function calculateHealthScore(params: {
  daysSinceApplied: number;
  hasFollowedUp: boolean;
  hasRecruiterContact: boolean;
  hasNetworkingContact: boolean;
  completedPrep: boolean;
}): number {
  let score = 100;
  if (params.daysSinceApplied > 14 && !params.hasFollowedUp) score -= 20;
  if (params.daysSinceApplied > 7 && !params.hasRecruiterContact) score -= 15;
  if (!params.hasNetworkingContact) score -= 10;
  if (!params.completedPrep) score -= 10;
  return Math.max(0, score);
}

export function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
  return arr.reduce((groups, item) => {
    const value = String(item[key]);
    return { ...groups, [value]: [...(groups[value] || []), item] };
  }, {} as Record<string, T[]>);
}

export const INDUSTRIES = [
  "Technology", "Finance", "Healthcare", "Education", "Retail",
  "Manufacturing", "Consulting", "Media", "Real Estate", "Government",
  "Non-profit", "Startup", "E-commerce", "Cybersecurity", "AI/ML",
  "Fintech", "Biotech", "Legal", "Marketing", "Sales",
];

export const SOURCES = [
  "LinkedIn", "Indeed", "Glassdoor", "Company Website", "Referral",
  "Recruiter", "Job Board", "Networking", "Cold Apply", "University",
  "Angel.co", "YC Jobs", "Blind", "Levels.fyi", "Other",
];

export const LOCATIONS = [
  "Remote", "New York, NY", "San Francisco, CA", "Seattle, WA",
  "Austin, TX", "Boston, MA", "Chicago, IL", "Los Angeles, CA",
  "Denver, CO", "Miami, FL", "Atlanta, GA", "Washington, DC",
];
