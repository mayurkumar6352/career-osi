import { prisma } from "@/lib/prisma";

export class DashboardRepository {
  static async getStats(userId: string) {
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const [
      totalApps, activeApps, upcomingInterviews, recruiters,
      contacts, tasksDue, offersReceived, activities
    ] = await Promise.all([
      prisma.application.count({ where: { userId } }),
      prisma.application.count({ where: { userId, status: { notIn: ["SAVED", "REJECTED", "GHOSTED", "ARCHIVED", "ACCEPTED"] } } }),
      prisma.interview.count({ where: { userId, scheduledAt: { gte: now, lte: nextWeek }, status: "SCHEDULED" } }),
      prisma.recruiter.count({ where: { userId } }),
      prisma.networkingContact.count({ where: { userId } }),
      prisma.task.count({ where: { userId, status: { in: ["TODO", "IN_PROGRESS"] }, dueDate: { lte: tomorrow } } }),
      prisma.offer.count({ where: { userId, status: { in: ["PENDING", "NEGOTIATING"] } } }),
      prisma.activity.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 20 }),
    ]);

    const appStats = await prisma.application.groupBy({
      by: ["status"],
      where: { userId },
      _count: true,
    });

    const statusMap = Object.fromEntries(appStats.map((s: any) => [s.status, s._count]));
    const applied = totalApps - (statusMap["SAVED"] || 0);
    const interviews = (statusMap["INTERVIEW_R1"] || 0) + (statusMap["INTERVIEW_R2"] || 0) + (statusMap["FINAL_INTERVIEW"] || 0);
    const offers = (statusMap["OFFER"] || 0) + (statusMap["NEGOTIATION"] || 0) + (statusMap["ACCEPTED"] || 0);

    return {
      totalApplications: totalApps,
      activeApplications: activeApps,
      interviewsScheduled: upcomingInterviews,
      recruitersContacted: recruiters,
      networkingContacts: contacts,
      responseRate: applied > 0 ? Math.round(((interviews + offers) / applied) * 100) : 0,
      interviewRate: applied > 0 ? Math.round((interviews / applied) * 100) : 0,
      offerRate: applied > 0 ? Math.round((offers / applied) * 100) : 0,
      rejectionRate: applied > 0 ? Math.round(((statusMap["REJECTED"] || 0) / applied) * 100) : 0,
      followUpsDue: tasksDue,
      tasksDue,
      upcomingInterviews,
      offersReceived,
      recentActivities: activities,
      statusBreakdown: statusMap,
    };
  }

  static async getIndustryBreakdown(userId: string) {
    const apps = await prisma.application.groupBy({
      by: ["industry"],
      where: { userId, industry: { not: null } },
      _count: true,
    });
    return apps.map((a: any) => ({ label: a.industry || "Unknown", value: a._count }));
  }

  static async getSourceBreakdown(userId: string) {
    const apps = await prisma.application.groupBy({
      by: ["source"],
      where: { userId, source: { not: null } },
      _count: true,
    });
    return apps.map((a: any) => ({ label: a.source || "Unknown", value: a._count }));
  }
}
