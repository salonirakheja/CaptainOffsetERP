import { prisma } from './prisma';

export async function getAllFactories() {
  return prisma.factory.findMany({ orderBy: { name: 'asc' } });
}

export async function getFactoryByCode(code: string) {
  return prisma.factory.findUnique({ where: { code } });
}

export async function getFactoryById(id: number) {
  return prisma.factory.findUnique({ where: { id } });
}
