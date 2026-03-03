import { prisma } from './prisma';

export async function getAllGateLogEntries(date?: Date) {
  const where: Record<string, unknown> = {};
  if (date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    where.entryTime = { gte: start, lt: end };
  }

  return prisma.gateLog.findMany({
    where,
    include: { loggedBy: { select: { id: true, name: true } } },
    orderBy: { entryTime: 'desc' },
  });
}

export async function createGateLogEntry(data: {
  factoryId: number;
  entryType: string;
  personName: string;
  vehicle: string;
  purpose: string;
  material: string;
  quantity: string;
  loggedById: number;
  notes: string;
}) {
  return prisma.gateLog.create({ data });
}

export async function markExit(id: number) {
  return prisma.gateLog.update({
    where: { id },
    data: { exitTime: new Date() },
  });
}

export async function getActiveEntries(factoryId: number) {
  return prisma.gateLog.findMany({
    where: { factoryId, exitTime: null },
    include: { loggedBy: { select: { id: true, name: true } } },
    orderBy: { entryTime: 'desc' },
  });
}
