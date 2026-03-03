'use server';

import { revalidatePath } from 'next/cache';
import { createJob, updateJobStatus } from '@/lib/db/jobs';

export async function createJobAction(formData: FormData) {
  const customerId = parseInt(formData.get('customerId') as string);
  const factoryId = parseInt(formData.get('factoryId') as string) || 1;
  const orderType = formData.get('orderType') as string;
  const productType = formData.get('productType') as string;
  const description = formData.get('description') as string;
  const paperType = formData.get('paperType') as string;
  const quantity = parseFloat(formData.get('quantity') as string) || 0;
  const unit = formData.get('unit') as string;
  const dueDateStr = formData.get('dueDate') as string;
  const notes = formData.get('notes') as string || '';
  const priority = formData.get('priority') as string || 'normal';

  // New v2 fields
  const gsm = formData.get('gsm') ? parseInt(formData.get('gsm') as string) : null;
  const sizeWidth = formData.get('sizeWidth') ? parseFloat(formData.get('sizeWidth') as string) : null;
  const sizeHeight = formData.get('sizeHeight') ? parseFloat(formData.get('sizeHeight') as string) : null;
  const sizeUnit = formData.get('sizeUnit') as string || 'inch';
  const numColors = formData.get('numColors') ? parseInt(formData.get('numColors') as string) : null;
  const printSides = formData.get('printSides') as string || 'single';
  const finishType = formData.get('finishType') as string || null;
  const boxLayers = formData.get('boxLayers') ? parseInt(formData.get('boxLayers') as string) : null;
  const boxBoardType = formData.get('boxBoardType') as string || null;
  const fluteType = formData.get('fluteType') as string || null;
  const estimatedCost = formData.get('estimatedCost') ? parseFloat(formData.get('estimatedCost') as string) : null;
  const quotedRate = formData.get('quotedRate') ? parseFloat(formData.get('quotedRate') as string) : null;

  if (!customerId || !orderType || !productType) {
    return { error: 'Customer, Order Type, and Product Type are required.' };
  }

  const job = await createJob({
    customerId,
    factoryId,
    orderType,
    productType,
    description: description || '',
    paperType: paperType || '',
    quantity,
    unit: unit || 'pieces',
    dueDate: dueDateStr ? new Date(dueDateStr) : null,
    notes,
    priority,
    gsm,
    sizeWidth,
    sizeHeight,
    sizeUnit,
    numColors,
    printSides,
    finishType,
    boxLayers,
    boxBoardType,
    fluteType,
    estimatedCost,
    quotedRate,
  });

  revalidatePath('/jobs');
  revalidatePath('/');
  return { success: true, jobId: job.id };
}

export async function updateJobStatusAction(jobId: number, status: string) {
  await updateJobStatus(jobId, status);
  revalidatePath(`/jobs/${jobId}`);
  revalidatePath('/jobs');
  revalidatePath('/');
  return { success: true };
}
