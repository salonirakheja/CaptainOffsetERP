import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { formatJobId, formatDate } from '@/types';

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const type = params.get('type');
  const dateFrom = params.get('dateFrom');
  const dateTo = params.get('dateTo');
  const customerId = params.get('customerId');
  const materialId = params.get('materialId');
  const status = params.get('status');

  const dateFilter: Record<string, Date> = {};
  if (dateFrom) dateFilter.gte = new Date(dateFrom);
  if (dateTo) {
    const to = new Date(dateTo);
    to.setHours(23, 59, 59, 999);
    dateFilter.lte = to;
  }

  if (type === 'jobs') {
    const where: Record<string, unknown> = {};
    if (customerId) where.customerId = parseInt(customerId);
    if (status) where.status = status;
    if (dateFrom || dateTo) where.createdAt = dateFilter;

    const jobs = await prisma.job.findMany({
      where,
      include: { customer: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const rows = jobs.map((j) => ({
      'Job ID': formatJobId(j.id),
      Customer: j.customer.name,
      Product: j.productType === 'box' ? 'Box' : 'Printing',
      'Order Type': j.orderType === 'job_work' ? 'Job Work' : 'CO Purchase',
      Quantity: `${j.quantity} ${j.unit}`,
      Status: j.status,
      'Due Date': formatDate(j.dueDate),
      Created: formatDate(j.createdAt),
    }));

    return NextResponse.json({ rows, count: rows.length });
  }

  if (type === 'stock') {
    const where: Record<string, unknown> = {};
    if (materialId) where.materialId = parseInt(materialId);
    if (dateFrom || dateTo) where.createdAt = dateFilter;

    const entries = await prisma.stockLedger.findMany({
      where,
      include: {
        material: { select: { name: true, unit: true } },
        job: { select: { id: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const rows = entries.map((e) => ({
      Date: formatDate(e.createdAt),
      Material: e.material.name,
      Type: e.entryType,
      Quantity: `${e.entryType === 'inward' || e.entryType === 'adjustment' ? '+' : '-'}${e.quantity} ${e.material.unit}`,
      'Job Ref': e.job ? formatJobId(e.job.id) : '—',
      'Logged By': e.loggedBy || '—',
      Notes: e.referenceNote || '—',
    }));

    return NextResponse.json({ rows, count: rows.length });
  }

  if (type === 'dispatch') {
    const where: Record<string, unknown> = {};
    if (customerId) where.customerId = parseInt(customerId);
    if (dateFrom || dateTo) where.dispatchDate = dateFilter;

    const dispatches = await prisma.dispatch.findMany({
      where,
      include: {
        job: { select: { id: true, description: true } },
        customer: { select: { name: true } },
      },
      orderBy: { dispatchDate: 'desc' },
    });

    const rows = dispatches.map((d) => ({
      'Job ID': formatJobId(d.job.id),
      Customer: d.customer.name,
      'Qty Dispatched': `${d.quantityDispatched} ${d.unit}`,
      Date: formatDate(d.dispatchDate),
      'Vehicle/Courier': d.vehicleOrCourier || '—',
      'Received By': d.receivedBy || '—',
    }));

    return NextResponse.json({ rows, count: rows.length });
  }

  return NextResponse.json({ rows: [], count: 0 });
}
