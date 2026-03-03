'use server';

import { revalidatePath } from 'next/cache';
import { createMaterial } from '@/lib/db/materials';
import { createStockEntry } from '@/lib/db/stock-ledger';

export async function createMaterialAction(formData: FormData) {
  const name = formData.get('name') as string;
  const category = formData.get('category') as string;
  const unit = formData.get('unit') as string;
  const reorderLevel = parseFloat(formData.get('reorderLevel') as string) || 0;
  const factoryId = parseInt(formData.get('factoryId') as string) || 1;

  if (!name || !category || !unit) {
    return { error: 'Name, Category, and Unit are required.' };
  }

  await createMaterial({ name, category, unit, reorderLevel, factoryId });
  revalidatePath('/inventory');
  return { success: true };
}

export async function logInwardAction(formData: FormData) {
  const materialId = parseInt(formData.get('materialId') as string);
  const quantity = parseFloat(formData.get('quantity') as string);
  const referenceNote = formData.get('referenceNote') as string || '';
  const loggedById = parseInt(formData.get('loggedById') as string);

  if (!materialId || !quantity || quantity <= 0) {
    return { error: 'Material and a positive quantity are required.' };
  }
  if (!loggedById) {
    return { error: 'Please log in first.' };
  }

  await createStockEntry({
    materialId,
    entryType: 'inward',
    quantity,
    referenceNote,
    loggedById,
  });

  revalidatePath('/inventory');
  revalidatePath('/');
  return { success: true };
}

export async function logOutwardAction(formData: FormData) {
  const materialId = parseInt(formData.get('materialId') as string);
  const quantity = parseFloat(formData.get('quantity') as string);
  const jobId = formData.get('jobId') ? parseInt(formData.get('jobId') as string) : null;
  const referenceNote = formData.get('referenceNote') as string || '';
  const loggedById = parseInt(formData.get('loggedById') as string);

  if (!materialId || !quantity || quantity <= 0) {
    return { error: 'Material and a positive quantity are required.' };
  }
  if (!loggedById) {
    return { error: 'Please log in first.' };
  }

  await createStockEntry({
    materialId,
    entryType: 'outward',
    quantity,
    jobId,
    referenceNote,
    loggedById,
  });

  revalidatePath('/inventory');
  revalidatePath('/jobs');
  revalidatePath('/');
  return { success: true };
}

export async function logWastageAction(formData: FormData) {
  const materialId = parseInt(formData.get('materialId') as string);
  const quantity = parseFloat(formData.get('quantity') as string);
  const jobId = formData.get('jobId') ? parseInt(formData.get('jobId') as string) : null;
  const referenceNote = formData.get('referenceNote') as string || '';
  const loggedById = parseInt(formData.get('loggedById') as string);

  if (!materialId || !quantity || quantity <= 0) {
    return { error: 'Material and a positive quantity are required.' };
  }
  if (!loggedById) {
    return { error: 'Please log in first.' };
  }

  await createStockEntry({
    materialId,
    entryType: 'wastage',
    quantity,
    jobId,
    referenceNote,
    loggedById,
  });

  revalidatePath('/inventory');
  revalidatePath('/jobs');
  revalidatePath('/');
  return { success: true };
}
