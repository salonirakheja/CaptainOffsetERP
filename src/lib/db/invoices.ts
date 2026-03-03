import { prisma } from './prisma';

export async function getAllInvoices() {
  return prisma.invoice.findMany({
    include: {
      customer: { select: { id: true, name: true } },
      _count: { select: { payments: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getInvoiceById(id: number) {
  return prisma.invoice.findUnique({
    where: { id },
    include: {
      customer: true,
      quotation: { select: { id: true, quotationNo: true } },
      payments: { orderBy: { paidAt: 'desc' } },
    },
  });
}

export async function generateInvoiceNo(): Promise<string> {
  const year = new Date().getFullYear();
  const last = await prisma.invoice.findFirst({
    where: { invoiceNo: { startsWith: `INV-${year}-` } },
    orderBy: { invoiceNo: 'desc' },
  });
  let seq = 1;
  if (last?.invoiceNo) {
    const parts = last.invoiceNo.split('-');
    seq = parseInt(parts[2]) + 1;
  }
  return `INV-${year}-${String(seq).padStart(4, '0')}`;
}

// GST calculation: UP factory → UP customer = CGST+SGST (intra-state), else IGST (inter-state)
function calculateGST(subtotal: number, customerState: string, gstRate: number = 18) {
  const isIntraState = customerState.toLowerCase() === 'up' || customerState.toLowerCase() === 'uttar pradesh';
  if (isIntraState) {
    const half = (subtotal * gstRate / 100) / 2;
    return { cgst: half, sgst: half, igst: 0, total: subtotal + half * 2 };
  } else {
    const igst = subtotal * gstRate / 100;
    return { cgst: 0, sgst: 0, igst, total: subtotal + igst };
  }
}

export async function createInvoice(data: {
  customerId: number;
  factoryId: number;
  quotationId?: number;
  subtotal: number;
  dueDate: Date | null;
  notes: string;
}) {
  const customer = await prisma.customer.findUniqueOrThrow({ where: { id: data.customerId } });
  const gst = calculateGST(data.subtotal, customer.state);
  const invoiceNo = await generateInvoiceNo();

  return prisma.invoice.create({
    data: {
      invoiceNo,
      customerId: data.customerId,
      factoryId: data.factoryId,
      quotationId: data.quotationId,
      subtotal: data.subtotal,
      cgst: gst.cgst,
      sgst: gst.sgst,
      igst: gst.igst,
      totalAmount: gst.total,
      dueDate: data.dueDate,
      notes: data.notes,
    },
  });
}

export async function addPayment(data: {
  invoiceId: number;
  amount: number;
  mode: string;
  reference: string;
  notes: string;
}) {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.create({ data });

    // Update invoice paid amount and status
    const invoice = await tx.invoice.findUniqueOrThrow({ where: { id: data.invoiceId } });
    const newPaid = invoice.paidAmount + data.amount;
    let status = 'partial';
    if (newPaid >= invoice.totalAmount) status = 'paid';

    await tx.invoice.update({
      where: { id: data.invoiceId },
      data: { paidAmount: newPaid, status },
    });

    return payment;
  });
}
