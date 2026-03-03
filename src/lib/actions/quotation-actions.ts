'use server';

import { revalidatePath } from 'next/cache';
import { createQuotation, updateQuotationStatus } from '@/lib/db/quotations';

export async function createQuotationAction(formData: FormData) {
  const customerId = parseInt(formData.get('customerId') as string);
  const factoryId = parseInt(formData.get('factoryId') as string) || 1;
  const items = formData.get('items') as string || '[]';
  const totalAmount = parseFloat(formData.get('totalAmount') as string) || 0;
  const validUntilStr = formData.get('validUntil') as string;
  const notes = formData.get('notes') as string || '';
  const createdById = parseInt(formData.get('createdById') as string);

  if (!customerId) {
    return { error: 'Customer is required.' };
  }
  if (!createdById) {
    return { error: 'Please log in first.' };
  }

  const quotation = await createQuotation({
    customerId,
    factoryId,
    items,
    totalAmount,
    validUntil: validUntilStr ? new Date(validUntilStr) : null,
    notes,
    createdById,
  });

  revalidatePath('/quotations');
  return { success: true, quotationId: quotation.id };
}

export async function updateQuotationStatusAction(id: number, status: string) {
  await updateQuotationStatus(id, status);
  revalidatePath('/quotations');
  return { success: true };
}
