import { prisma } from "@/lib/prisma";
import type { RecruiterInput } from "@/lib/validators/recruiter";

export class RecruiterRepository {
  static async findAll(userId: string, search?: string) {
    return prisma.recruiter.findMany({
      where: {
        userId,
        ...(search ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { company: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        } : {}),
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  static async findById(id: string, userId: string) {
    return prisma.recruiter.findFirst({
      where: { id, userId },
      include: {
        activities: { orderBy: { createdAt: "desc" }, take: 20 },
        tasks: { orderBy: { dueDate: "asc" } },
      },
    });
  }

  static async create(userId: string, data: RecruiterInput) {
    const recruiter = await prisma.recruiter.create({ data: { ...data, userId } });
    await prisma.activity.create({
      data: {
        userId,
        type: "RECRUITER_CONTACTED",
        title: `Added recruiter: ${data.name}`,
        description: `${data.type} at ${data.company || "Unknown"}`,
        recruiterId: recruiter.id,
      },
    });
    return recruiter;
  }

  static async update(id: string, userId: string, data: Partial<RecruiterInput>) {
    return prisma.recruiter.update({ where: { id, userId }, data });
  }

  static async delete(id: string, userId: string) {
    return prisma.recruiter.delete({ where: { id, userId } });
  }
}
