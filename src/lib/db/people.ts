import { prisma } from './prisma';

export async function getAllPeople() {
  return prisma.person.findMany({ orderBy: { name: 'asc' } });
}

export async function getActivePeople() {
  return prisma.person.findMany({
    where: { active: true },
    orderBy: { name: 'asc' },
  });
}

export async function getActivePeopleByFactory(factoryId: number) {
  return prisma.person.findMany({
    where: { active: true, factoryId },
    orderBy: { name: 'asc' },
  });
}

export async function getPersonById(id: number) {
  return prisma.person.findUnique({ where: { id } });
}

export async function verifyPin(personId: number, pin: string): Promise<boolean> {
  const person = await prisma.person.findUnique({ where: { id: personId } });
  if (!person) return false;
  return person.pin === pin;
}

export async function updatePin(personId: number, newPin: string) {
  return prisma.person.update({
    where: { id: personId },
    data: { pin: newPin },
  });
}

export async function createPerson(data: { name: string; role: string; factoryId: number; pin?: string; phone?: string }) {
  return prisma.person.create({ data });
}

export async function updatePerson(id: number, data: { name?: string; role?: string; active?: boolean; phone?: string }) {
  return prisma.person.update({ where: { id }, data });
}
