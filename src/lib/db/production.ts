import { prisma } from './prisma';

export async function getProductionStages(jobId: number) {
  return prisma.productionStage.findMany({
    where: { jobId },
    orderBy: { completedAt: 'asc' },
  });
}

export async function completeStage(data: {
  jobId: number;
  stageName: string;
  completedBy: string;
  notes?: string;
}) {
  return prisma.productionStage.create({
    data: {
      jobId: data.jobId,
      stageName: data.stageName,
      completedAt: new Date(),
      completedBy: data.completedBy,
      notes: data.notes || '',
    },
  });
}

export async function updateStage(id: number, data: { completedBy: string; notes: string }) {
  return prisma.productionStage.update({
    where: { id },
    data: { completedBy: data.completedBy, notes: data.notes },
  });
}
