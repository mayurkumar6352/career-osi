import { prisma } from "@/lib/prisma";
import type { ApplicationInput } from "@/lib/validators/application";
import type { FilterOptions, SortOption, PaginatedResult, Application, ApplicationStatus, Activity } from "@/types";

export class ApplicationRepository {
  static async findAll(
    userId: string,
    filters?: FilterOptions,
    sort?: SortOption,
    page = 1,
    pageSize = 20
  ): Promise<PaginatedResult<Application>> {
    const where: any = { userId };
    if (filters?.status?.length) where.status = { in: filters.status };
    if (filters?.priority?.length) where.priority = { in: filters.priority };
    if (filters?.industry) where.industry = filters.industry;
    if (filters?.source) where.source = filters.source;
    if (filters?.search) {
      where.OR = [
        { company: { contains: filters.search, mode: "insensitive" } },
        { jobTitle: { contains: filters.search, mode: "insensitive" } },
        { location: { contains: filters.search, mode: "insensitive" } },
      ];
    }
    if (filters?.dateFrom || filters?.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = filters.dateFrom;
      if (filters.dateTo) where.createdAt.lte = filters.dateTo;
    }
    const orderBy: any = sort ? { [sort.field]: sort.direction } : { createdAt: "desc" };
    const [data, total] = await Promise.all([
      prisma.application.findMany({
        where, orderBy,
        skip: (page - 1) * pageSize, take: pageSize,
        include: {
          interviews: { select: { id: true, status: true, scheduledAt: true } },
          offers: { select: { id: true, status: true, baseSalary: true } },
        },
      }),
      prisma.application.count({ where }),
    ]);
    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  static async findById(id: string, userId: string) {
    return prisma.application.findFirst({
      where: { id, userId },
      include: {
        interviews: { orderBy: { scheduledAt: "asc" } },
        offers: true,
        taskItems: { orderBy: { dueDate: "asc" } },
        noteItems: { orderBy: { createdAt: "desc" } },
        activities: { orderBy: { createdAt: "desc" }, take: 20 },
        statusHistory: { orderBy: { changedAt: "desc" } },
      },
    });
  }

  static async create(userId: string, data: ApplicationInput) {
    const app = await prisma.application.create({ data: { ...data, userId } });
    await prisma.activity.create({
      data: {
        userId, type: "APPLICATION_CREATED",
        title: `Applied to ${data.company}`,
        description: `Created application for ${data.jobTitle} at ${data.company}`,
        applicationId: app.id,
      },
    });
    await this.updateStreak(userId);
    return app;
  }

  static async update(id: string, userId: string, data: Partial<ApplicationInput>) {
    return prisma.application.update({ where: { id, userId }, data });
  }

  static async updateStatus(id: string, userId: string, status: ApplicationStatus, note?: string) {
    const app = await prisma.application.findFirst({ where: { id, userId } });
    if (!app) throw new Error("Application not found");
    const [updated] = await Promise.all([
      prisma.application.update({ where: { id }, data: { status } }),
      prisma.applicationStatusHistory.create({
        data: { applicationId: id, fromStatus: app.status, toStatus: status, note },
      }),
      prisma.activity.create({
        data: {
          userId, type: "APPLICATION_STATUS_CHANGED",
          title: `Status updated to ${status}`,
          description: note || `Status changed from ${app.status} to ${status}`,
          applicationId: id, metadata: { fromStatus: app.status, toStatus: status },
        },
      }),
    ]);
    return updated;
  }

  static async delete(id: string, userId: string) {
    return prisma.application.delete({ where: { id, userId } });
  }

  static async getStats(userId: string) {
    const apps = await prisma.application.findMany({
      where: { userId },
      select: { status: true, createdAt: true, appliedDate: true, industry: true, source: true },
    });
    const total = apps.length;
    const applied = apps.filter((a: any) => a.status !== "SAVED" && a.status !== "ARCHIVED").length;
    const interviews = apps.filter((a: any) => ["INTERVIEW_R1","INTERVIEW_R2","FINAL_INTERVIEW"].includes(a.status)).length;
    const offers = apps.filter((a: any) => ["OFFER","NEGOTIATION","ACCEPTED"].includes(a.status)).length;
    const rejected = apps.filter((a: any) => a.status === "REJECTED").length;
    const ghosted = apps.filter((a: any) => a.status === "GHOSTED").length;
    const accepted = apps.filter((a: any) => a.status === "ACCEPTED").length;
    return {
      total, applied, interviews, offers, rejected, ghosted, accepted,
      responseRate: applied > 0 ? Math.round(((interviews + offers + accepted) / applied) * 100) : 0,
      interviewRate: applied > 0 ? Math.round((interviews / applied) * 100) : 0,
      offerRate: applied > 0 ? Math.round((offers / applied) * 100) : 0,
      rejectionRate: applied > 0 ? Math.round((rejected / applied) * 100) : 0,
    };
  }

  static async getMonthlyData(userId: string) {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const apps = await prisma.application.findMany({
      where: { userId, createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true, status: true },
    });
    const monthly: Record<string, any> = {};
    apps.forEach((app: any) => {
      const key = new Date(app.createdAt).toISOString().slice(0, 7);
      if (!monthly[key]) monthly[key] = { applications: 0, responses: 0, interviews: 0, offers: 0 };
      monthly[key].applications++;
      if (!["SAVED","APPLIED"].includes(app.status)) monthly[key].responses++;
      if (["INTERVIEW_R1","INTERVIEW_R2","FINAL_INTERVIEW"].includes(app.status)) monthly[key].interviews++;
      if (["OFFER","NEGOTIATION","ACCEPTED"].includes(app.status)) monthly[key].offers++;
    });
    return Object.entries(monthly)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month: new Date(month + "-01").toLocaleString("default", { month: "short" }),
        ...(data as any),
      }));
  }

  private static async updateStreak(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await prisma.streak.upsert({
      where: { userId_date: { userId, date: today } },
      update: { applications: { increment: 1 } },
      create: { userId, date: today, applications: 1 },
    });
  }
}
