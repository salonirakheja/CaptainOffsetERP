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
      dispatchedBy: { select: { id: true, name: true } },
    },
    orderBy: { dispatchDate: 'desc' },
  });
}

export async function createDispatch(data: {
  jobId: number;
  customerId: number;
  factoryId: number;
  quantityDispatched: number;
  unit: string;
  dispatchDate: Date;
  vehicleOrCourier: string;
  receivedBy: string;
  dispatchedById?: number;
  notes: string;
}) {
  // Auto-generate challan number
  const year = new Date().getFullYear();
  const lastDispatch = await prisma.dispatch.findFirst({
    where: { challanNo: { startsWith: `DC-${year}-` } },
    orderBy: { challanNo: 'desc' },
  });
  let seq = 1;
  if (lastDispatch?.challanNo) {
    const parts = lastDispatch.challanNo.split('-');
    seq = parseInt(parts[2]) + 1;
  }
  const challanNo = `DC-${year}-${String(seq).padStart(4, '0')}`;

  return prisma.dispatch.create({
    data: {
      ...data,
      challanNo,
    },
  });
}

export async function getRecentDispatches(limit = 5) {
  return prisma.dispatch.findMany({
    include: {
      job: { select: { id: true, description: true } },
      customer: { select: { name: true } },
      dispatchedBy: { select: { id: true, name: true } },
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
