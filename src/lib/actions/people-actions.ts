'use server';

import { revalidatePath } from 'next/cache';
import { createPerson, updatePerson } from '@/lib/db/people';

export async function createPersonAction(formData: FormData) {
  const name = formData.get('name') as string;
  const role = formData.get('role') as string;

  if (!name || !role) {
    return { error: 'Name and role are required.' };
  }

  await createPerson({ name, role });
  revalidatePath('/people');
  return { success: true };
}

export async function updatePersonAction(id: number, formData: FormData) {
  const name = formData.get('name') as string || undefined;
  const role = formData.get('role') as string || undefined;
  const activeStr = formData.get('active') as string;
  const active = activeStr === 'true';

  await updatePerson(id, { name, role, active });
  revalidatePath('/people');
  return { success: true };
}
