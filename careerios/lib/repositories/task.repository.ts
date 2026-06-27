import { prisma } from "@/lib/prisma";
import type { TaskInput } from "@/lib/validators/task";

export class TaskRepository {
  static async findAll(userId: string, filters?: { status?: string[]; category?: string[]; priority?: string[] }) {
    const where: any = { userId };
    if (filters?.status?.length) where.status = { in: filters.status };
    if (filters?.category?.length) where.category = { in: filters.category };
    if (filters?.priority?.length) where.priority = { in: filters.priority };

    return prisma.task.findMany({
      where,
      orderBy: [{ priority: "desc" }, { dueDate: "asc" }],
      include: {
        application: { select: { id: true, company: true, jobTitle: true } },
        interview: { select: { id: true, title: true } },
      },
    });
  }

  static async findDue(userId: string) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return prisma.task.findMany({
      where: { userId, status: { in: ["TODO", "IN_PROGRESS"] }, dueDate: { lte: tomorrow } },
      orderBy: { dueDate: "asc" },
    });
  }

  static async create(userId: string, data: TaskInput) {
    return prisma.task.create({ data: { ...data, userId } });
  }

  static async update(id: string, userId: string, data: Partial<TaskInput>) {
    return prisma.task.update({ where: { id, userId }, data });
  }

  static async complete(id: string, userId: string) {
    const task = await prisma.task.update({
      where: { id, userId },
      data: { status: "DONE", completedAt: new Date() },
    });
    await prisma.activity.create({
      data: { userId, type: "TASK_COMPLETED", title: `Completed: ${task.title}`, applicationId: task.applicationId ?? undefined },
    });
    return task;
  }

  static async delete(id: string, userId: string) {
    return prisma.task.delete({ where: { id, userId } });
  }
}
