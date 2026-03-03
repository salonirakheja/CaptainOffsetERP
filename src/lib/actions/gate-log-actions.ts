'use server';

import { revalidatePath } from 'next/cache';
import { createGateLogEntry, markExit } from '@/lib/db/gate-log';

export async function createGateLogAction(formData: FormData) {
  const factoryId = parseInt(formData.get('factoryId') as string) || 1;
  const entryType = formData.get('entryType') as string;
  const personName = formData.get('personName') as string;
  const vehicle = formData.get('vehicle') as string || '';
  const purpose = formData.get('purpose') as string || '';
  const material = formData.get('material') as string || '';
  const quantity = formData.get('quantity') as string || '';
  const loggedById = parseInt(formData.get('loggedById') as string);
  const notes = formData.get('notes') as string || '';

  if (!entryType || !personName) {
    return { error: 'Entry type and person name are required.' };
  }
  if (!loggedById) {
    return { error: 'Please log in first.' };
  }

  await createGateLogEntry({
    factoryId,
    entryType,
    personName,
    vehicle,
    purpose,
    material,
    quantity,
    loggedById,
    notes,
  });

  revalidatePath('/gate-log');
  return { success: true };
}

export async function markExitAction(id: number) {
  await markExit(id);
  revalidatePath('/gate-log');
  return { success: true };
}
