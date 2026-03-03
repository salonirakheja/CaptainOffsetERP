'use server';

import { revalidatePath } from 'next/cache';
import { completeStage, updateStage } from '@/lib/db/production';
import { updateJobStatus } from '@/lib/db/jobs';
import { createStockEntry, updateStockEntry, deleteStockEntry } from '@/lib/db/stock-ledger';

export async function completeStageAction(
  jobId: number,
  stageName: string,
  completedById: number,
  notes: string,
  nextStatus: string,
  materialUsage?: { materialId: number; quantity: number }[]
) {
  await completeStage({ jobId, stageName, completedById, notes });
  await updateJobStatus(jobId, nextStatus);

  if (materialUsage && materialUsage.length > 0) {
    for (const usage of materialUsage) {
      await createStockEntry({
        materialId: usage.materialId,
        entryType: 'outward',
        quantity: usage.quantity,
        jobId,
        referenceNote: `Used at ${stageName} stage`,
        loggedById: completedById,
      });
    }
  }

  revalidatePath(`/jobs/${jobId}`);
  revalidatePath('/jobs');
  revalidatePath('/inventory');
  revalidatePath('/');
  return { success: true };
}

export async function updateStageAction(
  stageId: number,
  jobId: number,
  completedById: number,
  notes: string
) {
  if (!completedById) {
    return { error: 'Completed By is required.' };
  }

  await updateStage(stageId, { completedById, notes });
  revalidatePath(`/jobs/${jobId}`);
  return { success: true };
}

export async function logMaterialForJobAction(
  jobId: number,
  materialId: number,
  entryType: 'outward' | 'wastage',
  quantity: number,
  referenceNote: string,
  loggedById: number
) {
  if (!materialId || !quantity || quantity <= 0) {
    return { error: 'Material and a positive quantity are required.' };
  }

  await createStockEntry({
    materialId,
    entryType,
    quantity,
    jobId,
    referenceNote,
    loggedById,
  });

  revalidatePath(`/jobs/${jobId}`);
  revalidatePath('/inventory');
  revalidatePath('/');
  return { success: true };
}

export async function updateStockEntryAction(
  entryId: number,
  jobId: number,
  data: {
    materialId: number;
    entryType: 'outward' | 'wastage';
    quantity: number;
    referenceNote: string;
    loggedById: number;
  }
) {
  if (!data.materialId || !data.quantity || data.quantity <= 0) {
    return { error: 'Material and a positive quantity are required.' };
  }

  await updateStockEntry(entryId, {
    materialId: data.materialId,
    entryType: data.entryType,
    quantity: data.quantity,
    referenceNote: data.referenceNote,
    loggedById: data.loggedById,
  });

  revalidatePath(`/jobs/${jobId}`);
  revalidatePath('/inventory');
  revalidatePath('/');
  return { success: true };
}

export async function deleteStockEntryAction(entryId: number, jobId: number): Promise<{ success?: boolean; error?: string }> {
  try {
    await deleteStockEntry(entryId);

    revalidatePath(`/jobs/${jobId}`);
    revalidatePath('/inventory');
    revalidatePath('/');
    return { success: true };
  } catch {
    return { error: 'Failed to delete entry' };
  }
}
