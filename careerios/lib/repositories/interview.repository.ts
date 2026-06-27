import { prisma } from "@/lib/prisma";
import type { InterviewInput } from "@/lib/validators/interview";

export class InterviewRepository {
  static async findAll(userId: string) {
    return prisma.interview.findMany({
      where: { userId },
      orderBy: { scheduledAt: "asc" },
      include: {
        application: { select: { id: true, company: true, jobTitle: true } },
      },
    });
  }

  static async findUpcoming(userId: string, days = 7) {
    const now = new Date();
    const future = new Date();
    future.setDate(future.getDate() + days);
    return prisma.interview.findMany({
      where: { userId, scheduledAt: { gte: now, lte: future }, status: "SCHEDULED" },
      orderBy: { scheduledAt: "asc" },
      include: { application: { select: { company: true, jobTitle: true } } },
    });
  }

  static async findById(id: string, userId: string) {
    return prisma.interview.findFirst({
      where: { id, userId },
      include: {
        application: true,
        tasks: { orderBy: { dueDate: "asc" } },
        activities: { orderBy: { createdAt: "desc" }, take: 10 },
      },
    });
  }

  static async create(userId: string, data: InterviewInput) {
    const interview = await prisma.interview.create({
      data: { ...data, userId },
    });
    await prisma.activity.create({
      data: {
        userId,
        type: "INTERVIEW_SCHEDULED",
        title: `Interview scheduled: ${data.title}`,
        description: `${data.type} interview scheduled`,
        interviewId: interview.id,
        applicationId: data.applicationId ?? undefined,
      },
    });
    return interview;
  }

  static async update(id: string, userId: string, data: Partial<InterviewInput>) {
    return prisma.interview.update({ where: { id, userId }, data });
  }

  static async delete(id: string, userId: string) {
    return prisma.interview.delete({ where: { id, userId } });
  }
}
