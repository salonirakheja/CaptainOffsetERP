import { prisma } from './prisma';

export async function getAllCustomers() {
  return prisma.customer.findMany({
    include: {
      _count: { select: { jobs: true } },
      jobs: { orderBy: { createdAt: 'desc' }, take: 1, select: { createdAt: true } },
    },
    orderBy: { name: 'asc' },
  });
}

export async function getCustomerById(id: number) {
  return prisma.customer.findUnique({
    where: { id },
    include: {
      jobs: { include: { customer: true }, orderBy: { createdAt: 'desc' } },
      dispatches: { include: { job: true }, orderBy: { createdAt: 'desc' } },
    },
  });
}

export async function createCustomer(data: {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  gstin?: string;
  state?: string;
  factoryId: number;
}) {
  return prisma.customer.create({ data });
}

export async function updateCustomer(id: number, data: {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  gstin?: string;
  state?: string;
}) {
  return prisma.customer.update({ where: { id }, data });
}

export async function getCustomerDropdown() {
  return prisma.customer.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });
}
