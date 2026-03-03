import { prisma } from './prisma';

export async function getStockLedger(materialId: number) {
  const entries = await prisma.stockLedger.findMany({
    where: { materialId },
    include: { job: { select: { id: true, description: true } }, material: true },
    orderBy: { createdAt: 'asc' },
  });

  let balance = 0;
  return entries.map((e) => {
    if (e.entryType === 'inward' || e.entryType === 'adjustment') {
      balance += e.quantity;
    } else {
      balance -= e.quantity;
    }
    return { ...e, runningBalance: balance };
  });
}

export async function createStockEntry(data: {
  materialId: number;
  entryType: string;
  quantity: number;
  jobId?: number | null;
  referenceNote: string;
  loggedBy: string;
}) {
  return prisma.stockLedger.create({ data });
}

export async function updateStockEntry(id: number, data: {
  materialId: number;
  entryType: string;
  quantity: number;
  referenceNote: string;
  loggedBy: string;
}) {
  return prisma.stockLedger.update({ where: { id }, data });
}

export async function deleteStockEntry(id: number) {
  return prisma.stockLedger.delete({ where: { id } });
}

export async function getRecentStockEntries(limit = 10) {
  return prisma.stockLedger.findMany({
    include: { material: true, job: { select: { id: true, description: true } } },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}
