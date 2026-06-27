import { prisma } from "@/lib/prisma";
import type { NetworkingContactInput } from "@/lib/validators/networking";

export class NetworkingRepository {
  static async findAll(userId: string, search?: string) {
    return prisma.networkingContact.findMany({
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
    return prisma.networkingContact.findFirst({
      where: { id, userId },
      include: {
        activities: { orderBy: { createdAt: "desc" }, take: 20 },
        tasks: { orderBy: { dueDate: "asc" } },
      },
    });
  }

  static async create(userId: string, data: NetworkingContactInput) {
    return prisma.networkingContact.create({ data: { ...data, userId } });
  }

  static async update(id: string, userId: string, data: Partial<NetworkingContactInput>) {
    return prisma.networkingContact.update({ where: { id, userId }, data });
  }

  static async delete(id: string, userId: string) {
    return prisma.networkingContact.delete({ where: { id, userId } });
  }
}
