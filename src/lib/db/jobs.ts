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
      productionStages: {
        include: {
          completedBy: { select: { id: true, name: true } },
          startedBy: { select: { id: true, name: true } },
        },
        orderBy: { completedAt: 'asc' },
      },
      stockLedgerEntries: {
        include: {
          material: true,
          loggedBy: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
      dispatches: {
        include: {
          dispatchedBy: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
      jobMaterials: { include: { material: true } },
    },
  });
}

export async function createJob(data: {
  customerId: number;
  factoryId: number;
  orderType: string;
  productType: string;
  description: string;
  paperType: string;
  quantity: number;
  unit: string;
  dueDate: Date | null;
  notes: string;
  priority?: string;
  gsm?: number | null;
  sizeWidth?: number | null;
  sizeHeight?: number | null;
  sizeUnit?: string;
  numColors?: number | null;
  printSides?: string;
  finishType?: string | null;
  boxLayers?: number | null;
  boxBoardType?: string | null;
  fluteType?: string | null;
  estimatedCost?: number | null;
  quotedRate?: number | null;
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
