'use server';

import { revalidatePath } from 'next/cache';
import { createInvoice, addPayment } from '@/lib/db/invoices';

export async function createInvoiceAction(formData: FormData) {
  const customerId = parseInt(formData.get('customerId') as string);
  const factoryId = parseInt(formData.get('factoryId') as string) || 1;
  const quotationId = formData.get('quotationId') ? parseInt(formData.get('quotationId') as string) : undefined;
  const subtotal = parseFloat(formData.get('subtotal') as string) || 0;
  const dueDateStr = formData.get('dueDate') as string;
  const notes = formData.get('notes') as string || '';

  if (!customerId || !subtotal) {
    return { error: 'Customer and subtotal are required.' };
  }

  const invoice = await createInvoice({
    customerId,
    factoryId,
    quotationId,
    subtotal,
    dueDate: dueDateStr ? new Date(dueDateStr) : null,
    notes,
  });

  revalidatePath('/invoices');
  return { success: true, invoiceId: invoice.id };
}

export async function addPaymentAction(formData: FormData) {
  const invoiceId = parseInt(formData.get('invoiceId') as string);
  const amount = parseFloat(formData.get('amount') as string);
  const mode = formData.get('mode') as string || 'cash';
  const reference = formData.get('reference') as string || '';
  const notes = formData.get('notes') as string || '';

  if (!invoiceId || !amount || amount <= 0) {
    return { error: 'Invoice and a positive amount are required.' };
  }

  await addPayment({ invoiceId, amount, mode, reference, notes });

  revalidatePath('/invoices');
  return { success: true };
}
