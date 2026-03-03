'use server';

import { revalidatePath } from 'next/cache';
import { createDispatch } from '@/lib/db/dispatch';
import { updateJobStatus } from '@/lib/db/jobs';

export async function createDispatchAction(formData: FormData) {
  const jobId = parseInt(formData.get('jobId') as string);
  const customerId = parseInt(formData.get('customerId') as string);
  const quantityDispatched = parseFloat(formData.get('quantityDispatched') as string);
  const unit = formData.get('unit') as string || 'pieces';
  const dispatchDateStr = formData.get('dispatchDate') as string;
  const vehicleOrCourier = formData.get('vehicleOrCourier') as string || '';
  const receivedBy = formData.get('receivedBy') as string || '';
  const notes = formData.get('notes') as string || '';

  if (!jobId || !customerId || !quantityDispatched) {
    return { error: 'Job, customer, and quantity are required.' };
  }

  await createDispatch({
    jobId,
    customerId,
    quantityDispatched,
    unit,
    dispatchDate: dispatchDateStr ? new Date(dispatchDateStr) : new Date(),
    vehicleOrCourier,
    receivedBy,
    notes,
  });

  await updateJobStatus(jobId, 'dispatched');

  revalidatePath('/dispatch');
  revalidatePath('/jobs');
  revalidatePath('/');
  return { success: true };
}
