import { prisma } from "@/lib/prisma";
import type { OfferInput } from "@/lib/validators/offer";

export class OfferRepository {
  static async findAll(userId: string) {
    return prisma.offer.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { application: { select: { id: true, company: true, jobTitle: true } } },
    });
  }

  static async findById(id: string, userId: string) {
    return prisma.offer.findFirst({
      where: { id, userId },
      include: { application: true },
    });
  }

  static async create(userId: string, data: OfferInput) {
    const offer = await prisma.offer.create({ data: { ...data, userId } });
    await prisma.activity.create({
      data: {
        userId,
        type: "OFFER_RECEIVED",
        title: `Offer received from ${data.company}`,
        description: `${data.jobTitle} — ${data.baseSalary} ${data.currency}`,
        applicationId: data.applicationId ?? undefined,
      },
    });
    return offer;
  }

  static async update(id: string, userId: string, data: Partial<OfferInput>) {
    return prisma.offer.update({ where: { id, userId }, data });
  }

  static async delete(id: string, userId: string) {
    return prisma.offer.delete({ where: { id, userId } });
  }
}
