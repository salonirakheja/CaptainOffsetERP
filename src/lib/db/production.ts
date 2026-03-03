import { prisma } from './prisma';

export async function getProductionStages(jobId: number) {
  return prisma.productionStage.findMany({
    where: { jobId },
    include: {
      completedBy: { select: { id: true, name: true } },
      startedBy: { select: { id: true, name: true } },
    },
    orderBy: { completedAt: 'asc' },
  });
}

export async function completeStage(data: {
  jobId: number;
  stageName: string;
  completedById: number;
  notes?: string;
}) {
  return prisma.productionStage.create({
    data: {
      jobId: data.jobId,
      stageName: data.stageName,
      completedAt: new Date(),
      completedById: data.completedById,
      notes: data.notes || '',
    },
  });
}

export async function updateStage(id: number, data: { completedById: number; notes: string }) {
  return prisma.productionStage.update({
    where: { id },
    data: { completedById: data.completedById, notes: data.notes },
  });
}
