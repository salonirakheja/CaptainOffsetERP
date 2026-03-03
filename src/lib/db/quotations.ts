import { prisma } from './prisma';

export async function getAllQuotations() {
  return prisma.quotation.findMany({
    include: {
      customer: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true } },
      _count: { select: { jobs: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getQuotationById(id: number) {
  return prisma.quotation.findUnique({
    where: { id },
    include: {
      customer: true,
      createdBy: { select: { id: true, name: true } },
      jobs: { select: { id: true, description: true, status: true } },
      invoices: { select: { id: true, invoiceNo: true, status: true, totalAmount: true } },
    },
  });
}

export async function generateQuotationNo(): Promise<string> {
  const year = new Date().getFullYear();
  const last = await prisma.quotation.findFirst({
    where: { quotationNo: { startsWith: `QT-${year}-` } },
    orderBy: { quotationNo: 'desc' },
  });
  let seq = 1;
  if (last?.quotationNo) {
    const parts = last.quotationNo.split('-');
    seq = parseInt(parts[2]) + 1;
  }
  return `QT-${year}-${String(seq).padStart(4, '0')}`;
}

export async function createQuotation(data: {
  customerId: number;
  factoryId: number;
  items: string;
  totalAmount: number;
  validUntil: Date | null;
  notes: string;
  createdById: number;
}) {
  const quotationNo = await generateQuotationNo();
  return prisma.quotation.create({
    data: {
      ...data,
      quotationNo,
    },
  });
}

export async function updateQuotationStatus(id: number, status: string) {
  return prisma.quotation.update({ where: { id }, data: { status } });
}
