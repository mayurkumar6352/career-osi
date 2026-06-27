// These types will be available after running: npx prisma generate
// During development they come from @prisma/client once generated

export type ApplicationStatus =
  | "SAVED" | "APPLIED" | "ASSESSMENT" | "RECRUITER_SCREEN"
  | "INTERVIEW_R1" | "INTERVIEW_R2" | "FINAL_INTERVIEW"
  | "OFFER" | "NEGOTIATION" | "ACCEPTED" | "REJECTED" | "GHOSTED" | "ARCHIVED";

export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type LocationType = "REMOTE" | "HYBRID" | "ONSITE";
export type EmploymentType = "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP" | "FREELANCE";
export type InterviewType = "PHONE_SCREEN" | "VIDEO_CALL" | "TECHNICAL" | "BEHAVIORAL" | "SYSTEM_DESIGN" | "TAKE_HOME" | "ONSITE" | "HR" | "FINAL" | "PANEL";
export type InterviewStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED" | "RESCHEDULED" | "NO_SHOW";
export type RecruiterType = "RECRUITER" | "HIRING_MANAGER" | "FOUNDER" | "HR" | "REFERRAL" | "HEADHUNTER";
export type NetworkingType = "CONNECTION" | "ALUMNI" | "MENTOR" | "REFERRAL" | "COLLEAGUE" | "FRIEND";
export type RelationshipHealth = "HOT" | "WARM" | "COLD" | "INACTIVE";
export type OfferStatus = "PENDING" | "ACCEPTED" | "DECLINED" | "NEGOTIATING" | "EXPIRED" | "RESCINDED";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE" | "CANCELLED";
export type TaskCategory = "FOLLOW_UP" | "INTERVIEW_PREP" | "NETWORKING" | "RESEARCH" | "APPLICATION" | "GENERAL";
export type ActivityType =
  | "APPLICATION_CREATED" | "APPLICATION_STATUS_CHANGED" | "APPLICATION_UPDATED"
  | "INTERVIEW_SCHEDULED" | "INTERVIEW_COMPLETED"
  | "RECRUITER_CONTACTED" | "RECRUITER_REPLIED"
  | "NETWORKING_MESSAGE_SENT" | "NETWORKING_REPLY"
  | "OFFER_RECEIVED" | "OFFER_ACCEPTED" | "OFFER_DECLINED"
  | "TASK_COMPLETED" | "NOTE_ADDED" | "FOLLOW_UP_SENT";
export type NotificationType =
  | "INTERVIEW_REMINDER" | "FOLLOW_UP_DUE" | "TASK_DUE"
  | "OFFER_EXPIRING" | "STREAK_MILESTONE" | "WEEKLY_SUMMARY" | "GENERAL";

export interface User {
  id: string; email: string; name?: string | null; avatarUrl?: string | null;
  title?: string | null; location?: string | null; bio?: string | null;
  targetRole?: string | null; targetSalaryMin?: number | null; targetSalaryMax?: number | null;
  onboardingDone: boolean; createdAt: Date; updatedAt: Date;
}

export interface Application {
  id: string; userId: string; company: string; jobTitle: string;
  jobUrl?: string | null; status: ApplicationStatus; priority: Priority;
  location?: string | null; locationType?: LocationType | null;
  salaryMin?: number | null; salaryMax?: number | null; salaryCurrency: string;
  employmentType?: EmploymentType | null; jobDescription?: string | null;
  requirements?: string | null; benefits?: string | null;
  companyWebsite?: string | null; companySize?: string | null;
  industry?: string | null; source?: string | null;
  appliedDate?: Date | null; deadlineDate?: Date | null; responseDate?: Date | null;
  tags: string[]; skills: string[]; coverLetter?: string | null;
  resumeVersion?: string | null; notes?: string | null;
  healthScore?: number | null; followUpScore?: number | null;
  createdAt: Date; updatedAt: Date;
}

export interface ApplicationStatusHistory {
  id: string; applicationId: string; fromStatus?: ApplicationStatus | null;
  toStatus: ApplicationStatus; changedAt: Date; note?: string | null;
}

export interface Interview {
  id: string; userId: string; applicationId?: string | null;
  title: string; type: InterviewType; status: InterviewStatus;
  platform?: string | null; meetingUrl?: string | null;
  scheduledAt: Date; duration: number; location?: string | null;
  interviewers: string[]; notes?: string | null; feedback?: string | null;
  rating?: number | null; questionsAsked: string[];
  myAnswers?: string | null; nextSteps?: string | null; prepNotes?: string | null;
  createdAt: Date; updatedAt: Date;
}

export interface Recruiter {
  id: string; userId: string; name: string; email?: string | null;
  phone?: string | null; title?: string | null; company?: string | null;
  linkedinUrl?: string | null; type: RecruiterType;
  relationshipScore: number; lastContactDate?: Date | null;
  responseRate?: number | null; notes?: string | null; tags: string[];
  createdAt: Date; updatedAt: Date;
}

export interface NetworkingContact {
  id: string; userId: string; name: string; email?: string | null;
  phone?: string | null; title?: string | null; company?: string | null;
  linkedinUrl?: string | null; type: NetworkingType;
  relationshipHealth: RelationshipHealth; lastContactDate?: Date | null;
  messagesSent: number; repliesReceived: number; meetingCount: number;
  notes?: string | null; tags: string[]; source?: string | null;
  createdAt: Date; updatedAt: Date;
}

export interface Offer {
  id: string; userId: string; applicationId?: string | null;
  company: string; jobTitle: string; status: OfferStatus;
  baseSalary: number; currency: string;
  bonus?: number | null; bonusType?: string | null;
  equity?: number | null; equityType?: string | null;
  signingBonus?: number | null; benefits: string[];
  remotePolicty?: string | null; workLocation?: string | null;
  startDate?: Date | null; expiryDate?: Date | null;
  ptodays?: number | null; healthInsurance?: boolean | null;
  dentalVision?: boolean | null; retirement401k?: boolean | null;
  notes?: string | null; comparisonScore?: number | null;
  createdAt: Date; updatedAt: Date;
}

export interface Task {
  id: string; userId: string; title: string; description?: string | null;
  status: TaskStatus; priority: Priority; category: TaskCategory;
  dueDate?: Date | null; completedAt?: Date | null;
  applicationId?: string | null; interviewId?: string | null;
  recruiterId?: string | null; contactId?: string | null;
  createdAt: Date; updatedAt: Date;
}

export interface Note {
  id: string; userId: string; applicationId?: string | null;
  content: string; createdAt: Date; updatedAt: Date;
}

export interface Activity {
  id: string; userId: string; type: ActivityType; title: string;
  description?: string | null; applicationId?: string | null;
  interviewId?: string | null; recruiterId?: string | null;
  contactId?: string | null; metadata?: any; createdAt: Date;
}

export interface Notification {
  id: string; userId: string; type: NotificationType;
  title: string; message: string; read: boolean;
  link?: string | null; createdAt: Date;
}

export interface Streak {
  id: string; userId: string; date: Date;
  applications: number; contacts: number;
  networking: number; prepTime: number; createdAt: Date;
}

export type ApplicationWithRelations = Application & {
  interviews?: Interview[];
  offers?: Offer[];
  taskItems?: Task[];
  noteItems?: Note[];
  activities?: Activity[];
  statusHistory?: ApplicationStatusHistory[];
};

export type InterviewWithApplication = Interview & {
  application?: Pick<Application, "id" | "company" | "jobTitle"> | null;
};

export type DashboardStats = {
  totalApplications: number; activeApplications: number;
  interviewsScheduled: number; recruitersContacted: number;
  networkingContacts: number; responseRate: number;
  interviewRate: number; offerRate: number; rejectionRate: number;
  followUpsDue: number; tasksDue: number; upcomingInterviews: number;
  offersReceived: number; recentActivities: Activity[];
  statusBreakdown: Record<string, number>;
};

export type FunnelData = { stage: string; count: number; rate: number; };
export type ChartDataPoint = { label: string; value: number; color?: string; };
export type MonthlyData = { month: string; applications: number; responses: number; interviews: number; offers: number; };

export type ActionResult<T = void> = { success: boolean; data?: T; error?: string; };

export type PaginatedResult<T> = {
  data: T[]; total: number; page: number; pageSize: number; totalPages: number;
};

export type FilterOptions = {
  status?: ApplicationStatus[]; priority?: Priority[];
  location?: string; industry?: string; source?: string;
  dateFrom?: Date; dateTo?: Date; tags?: string[]; search?: string;
};

export type SortOption = { field: string; direction: "asc" | "desc"; };

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  SAVED: "Saved", APPLIED: "Applied", ASSESSMENT: "Assessment",
  RECRUITER_SCREEN: "Recruiter Screen", INTERVIEW_R1: "Interview R1",
  INTERVIEW_R2: "Interview R2", FINAL_INTERVIEW: "Final Interview",
  OFFER: "Offer", NEGOTIATION: "Negotiation", ACCEPTED: "Accepted",
  REJECTED: "Rejected", GHOSTED: "Ghosted", ARCHIVED: "Archived",
};

export const APPLICATION_STATUS_COLORS: Record<ApplicationStatus, string> = {
  SAVED: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  APPLIED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  ASSESSMENT: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  RECRUITER_SCREEN: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  INTERVIEW_R1: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  INTERVIEW_R2: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  FINAL_INTERVIEW: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
  OFFER: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  NEGOTIATION: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  ACCEPTED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  REJECTED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  GHOSTED: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  ARCHIVED: "bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-500",
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  LOW: "text-slate-500", MEDIUM: "text-blue-500", HIGH: "text-orange-500", URGENT: "text-red-500",
};

export const INTERVIEW_TYPE_LABELS: Record<InterviewType, string> = {
  PHONE_SCREEN: "Phone Screen", VIDEO_CALL: "Video Call", TECHNICAL: "Technical",
  BEHAVIORAL: "Behavioral", SYSTEM_DESIGN: "System Design", TAKE_HOME: "Take-Home",
  ONSITE: "On-site", HR: "HR", FINAL: "Final", PANEL: "Panel",
};
