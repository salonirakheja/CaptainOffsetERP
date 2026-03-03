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

export async function createPerson(data: { name: string; role: string }) {
  return prisma.person.create({ data });
}

export async function updatePerson(id: number, data: { name?: string; role?: string; active?: boolean }) {
  return prisma.person.update({ where: { id }, data });
}
