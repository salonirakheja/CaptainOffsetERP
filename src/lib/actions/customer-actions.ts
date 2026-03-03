'use server';

import { revalidatePath } from 'next/cache';
import { createCustomer, updateCustomer } from '@/lib/db/customers';

export async function createCustomerAction(formData: FormData) {
  const name = formData.get('name') as string;
  const phone = formData.get('phone') as string || '';
  const email = formData.get('email') as string || '';
  const address = formData.get('address') as string || '';
  const gstin = formData.get('gstin') as string || '';
  const state = formData.get('state') as string || '';
  const factoryId = parseInt(formData.get('factoryId') as string) || 1;

  if (!name) {
    return { error: 'Customer name is required.' };
  }

  const customer = await createCustomer({ name, phone, email, address, gstin, state, factoryId });
  revalidatePath('/customers');
  revalidatePath('/jobs');
  return { success: true, customerId: customer.id };
}

export async function updateCustomerAction(id: number, formData: FormData) {
  const name = formData.get('name') as string;
  const phone = formData.get('phone') as string || '';
  const email = formData.get('email') as string || '';
  const address = formData.get('address') as string || '';
  const gstin = formData.get('gstin') as string || '';
  const state = formData.get('state') as string || '';

  if (!name) {
    return { error: 'Customer name is required.' };
  }

  await updateCustomer(id, { name, phone, email, address, gstin, state });
  revalidatePath('/customers');
  return { success: true };
}
