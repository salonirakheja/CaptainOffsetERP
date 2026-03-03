'use server';

import { revalidatePath } from 'next/cache';
import { createJob, updateJobStatus } from '@/lib/db/jobs';

export async function createJobAction(formData: FormData) {
  const customerId = parseInt(formData.get('customerId') as string);
  const orderType = formData.get('orderType') as string;
  const productType = formData.get('productType') as string;
  const description = formData.get('description') as string;
  const paperType = formData.get('paperType') as string;
  const quantity = parseFloat(formData.get('quantity') as string) || 0;
  const unit = formData.get('unit') as string;
  const dueDateStr = formData.get('dueDate') as string;
  const notes = formData.get('notes') as string || '';

  if (!customerId || !orderType || !productType) {
    return { error: 'Customer, Order Type, and Product Type are required.' };
  }

  const job = await createJob({
    customerId,
    orderType,
    productType,
    description: description || '',
    paperType: paperType || '',
    quantity,
    unit: unit || 'pieces',
    dueDate: dueDateStr ? new Date(dueDateStr) : null,
    notes,
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
