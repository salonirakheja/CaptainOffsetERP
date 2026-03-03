import { prisma } from './prisma';

export async function getAllJobs(filters?: {
  status?: string;
  productType?: string;
  orderType?: string;
  search?: string;
}) {
  const where: Record<string, unknown> = {};
  if (filters?.status) where.status = filters.status;
  if (filters?.productType) where.productType = filters.productType;
  if (filters?.orderType) where.orderType = filters.orderType;
  if (filters?.search) {
    where.OR = [
      { description: { contains: filters.search } },
      { customer: { name: { contains: filters.search } } },
    ];
  }

  return prisma.job.findMany({
    where,
    include: { customer: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getJobById(id: number) {
  return prisma.job.findUnique({
    where: { id },
    include: {
      customer: true,
      productionStages: { orderBy: { completedAt: 'asc' } },
      stockLedgerEntries: { include: { material: true }, orderBy: { createdAt: 'desc' } },
      dispatches: { orderBy: { createdAt: 'desc' } },
    },
  });
}

export async function createJob(data: {
  customerId: number;
  orderType: string;
  productType: string;
  description: string;
  paperType: string;
  quantity: number;
  unit: string;
  dueDate: Date | null;
  notes: string;
}) {
  return prisma.job.create({ data });
}

export async function updateJobStatus(id: number, status: string) {
  return prisma.job.update({ where: { id }, data: { status } });
}

export async function getActiveJobs() {
  return prisma.job.findMany({
    where: { status: { notIn: ['dispatched', 'cancelled'] } },
    include: { customer: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getReadyJobs() {
  return prisma.job.findMany({
    where: { status: 'ready' },
    include: { customer: true },
    orderBy: { createdAt: 'desc' },
  });
}
