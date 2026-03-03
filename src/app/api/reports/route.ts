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
      Priority: j.priority,
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
        loggedBy: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const rows = entries.map((e) => ({
      Date: formatDate(e.createdAt),
      Material: e.material.name,
      Type: e.entryType,
      Quantity: `${e.entryType === 'inward' || e.entryType === 'adjustment' ? '+' : '-'}${e.quantity} ${e.material.unit}`,
      Balance: e.balanceAfter,
      'Job Ref': e.job ? formatJobId(e.job.id) : '—',
      'Logged By': e.loggedBy?.name || '—',
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
        dispatchedBy: { select: { name: true } },
      },
      orderBy: { dispatchDate: 'desc' },
    });

    const rows = dispatches.map((d) => ({
      'Challan No': d.challanNo || '—',
      'Job ID': formatJobId(d.job.id),
      Customer: d.customer.name,
      'Qty Dispatched': `${d.quantityDispatched} ${d.unit}`,
      Date: formatDate(d.dispatchDate),
      'Vehicle/Courier': d.vehicleOrCourier || '—',
      'Received By': d.receivedBy || '—',
      'Dispatched By': d.dispatchedBy?.name || '—',
    }));

    return NextResponse.json({ rows, count: rows.length });
  }

  if (type === 'daily_production') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [stages, stockEntries, dispatches] = await Promise.all([
      prisma.productionStage.findMany({
        where: { completedAt: { gte: today, lt: tomorrow } },
        include: {
          job: { select: { id: true, description: true } },
          completedBy: { select: { name: true } },
        },
      }),
      prisma.stockLedger.findMany({
        where: { createdAt: { gte: today, lt: tomorrow }, entryType: { in: ['outward', 'wastage'] } },
        include: {
          material: { select: { name: true, unit: true } },
          job: { select: { id: true } },
        },
      }),
      prisma.dispatch.findMany({
        where: { dispatchDate: { gte: today, lt: tomorrow } },
        include: {
          job: { select: { id: true } },
          customer: { select: { name: true } },
        },
      }),
    ]);

    const rows = [
      ...stages.map((s) => ({
        Category: 'Stage Completed',
        Detail: `${s.stageName} — ${s.job.description || formatJobId(s.job.id)}`,
        By: s.completedBy?.name || '—',
        Quantity: '—',
      })),
      ...stockEntries.map((e) => ({
        Category: `Material ${e.entryType}`,
        Detail: `${e.material.name}${e.job ? ` (${formatJobId(e.job.id)})` : ''}`,
        By: '—',
        Quantity: `${e.quantity} ${e.material.unit}`,
      })),
      ...dispatches.map((d) => ({
        Category: 'Dispatch',
        Detail: `${formatJobId(d.job.id)} → ${d.customer.name}`,
        By: '—',
        Quantity: `${d.quantityDispatched} ${d.unit}`,
      })),
    ];

    return NextResponse.json({ rows, count: rows.length });
  }

  if (type === 'material_consumption') {
    const where: Record<string, unknown> = { entryType: { in: ['outward', 'wastage'] } };
    if (materialId) where.materialId = parseInt(materialId);
    if (dateFrom || dateTo) where.createdAt = dateFilter;

    const entries = await prisma.stockLedger.findMany({
      where,
      include: {
        material: { select: { name: true, unit: true } },
        job: { select: { id: true, description: true } },
        loggedBy: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const rows = entries.map((e) => ({
      Date: formatDate(e.createdAt),
      Material: e.material.name,
      Type: e.entryType,
      Quantity: `${e.quantity} ${e.material.unit}`,
      'Job Ref': e.job ? `${formatJobId(e.job.id)} — ${e.job.description}` : '—',
      'Logged By': e.loggedBy?.name || '—',
      Notes: e.referenceNote || '—',
    }));

    return NextResponse.json({ rows, count: rows.length });
  }

  if (type === 'outstanding_payments') {
    const invoices = await prisma.invoice.findMany({
      where: { status: { in: ['unpaid', 'partial', 'overdue'] } },
      include: { customer: { select: { name: true } } },
      orderBy: { createdAt: 'asc' },
    });

    const rows = invoices.map((inv) => {
      const outstanding = inv.totalAmount - inv.paidAmount;
      const daysOverdue = inv.dueDate
        ? Math.max(0, Math.floor((Date.now() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24)))
        : 0;
      return {
        'Invoice No': inv.invoiceNo,
        Customer: inv.customer.name,
        Total: `₹${inv.totalAmount.toFixed(2)}`,
        Paid: `₹${inv.paidAmount.toFixed(2)}`,
        Outstanding: `₹${outstanding.toFixed(2)}`,
        'Days Overdue': daysOverdue,
        Status: inv.status,
      };
    });

    return NextResponse.json({ rows, count: rows.length });
  }

  if (type === 'person_activity') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const activities = await prisma.activityLog.findMany({
      where: { createdAt: { gte: today, lt: tomorrow } },
      include: { person: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const rows = activities.map((a) => ({
      Time: formatDate(a.createdAt),
      Person: a.person.name,
      Action: a.action,
      Entity: `${a.entityType} #${a.entityId}`,
      Detail: a.field ? `${a.field}: ${a.oldValue} → ${a.newValue}` : '—',
    }));

    return NextResponse.json({ rows, count: rows.length });
  }

  return NextResponse.json({ rows: [], count: 0 });
}
