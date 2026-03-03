import { prisma } from './prisma';

export async function getAllDispatches(filters?: {
  customerId?: number;
  dateFrom?: Date;
  dateTo?: Date;
}) {
  const where: Record<string, unknown> = {};
  if (filters?.customerId) where.customerId = filters.customerId;
  if (filters?.dateFrom || filters?.dateTo) {
    where.dispatchDate = {};
    if (filters?.dateFrom) (where.dispatchDate as Record<string, Date>).gte = filters.dateFrom;
    if (filters?.dateTo) (where.dispatchDate as Record<string, Date>).lte = filters.dateTo;
  }

  return prisma.dispatch.findMany({
    where,
    include: {
      job: { select: { id: true, description: true, productType: true } },
      customer: { select: { id: true, name: true } },
    },
    orderBy: { dispatchDate: 'desc' },
  });
}

export async function createDispatch(data: {
  jobId: number;
  customerId: number;
  quantityDispatched: number;
  unit: string;
  dispatchDate: Date;
  vehicleOrCourier: string;
  receivedBy: string;
  notes: string;
}) {
  return prisma.dispatch.create({ data });
}

export async function getRecentDispatches(limit = 5) {
  return prisma.dispatch.findMany({
    include: {
      job: { select: { id: true, description: true } },
      customer: { select: { name: true } },
    },
    orderBy: { dispatchDate: 'desc' },
    take: limit,
  });
}

export async function getTodaysDispatches() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return prisma.dispatch.count({
    where: {
      dispatchDate: { gte: today, lt: tomorrow },
    },
  });
}
