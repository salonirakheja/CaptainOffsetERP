import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const [jobs, customers, materials] = await Promise.all([
    prisma.job.findMany({
      where: {
        OR: [
          { description: { contains: q, mode: 'insensitive' } },
          { id: isNaN(parseInt(q)) ? undefined : parseInt(q) },
        ].filter(Boolean) as Record<string, unknown>[],
      },
      select: { id: true, description: true, status: true, productType: true },
      take: 5,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.customer.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { phone: { contains: q } },
        ],
      },
      select: { id: true, name: true, phone: true },
      take: 5,
      orderBy: { name: 'asc' },
    }),
    prisma.material.findMany({
      where: { name: { contains: q, mode: 'insensitive' } },
      select: { id: true, name: true, unit: true, currentStock: true },
      take: 5,
      orderBy: { name: 'asc' },
    }),
  ]);

  const results = [
    ...jobs.map((j) => ({
      type: 'job' as const,
      id: j.id,
      title: `CO-${String(j.id).padStart(4, '0')} — ${j.description}`,
      subtitle: `${j.productType} · ${j.status}`,
      href: `/jobs/${j.id}`,
    })),
    ...customers.map((c) => ({
      type: 'customer' as const,
      id: c.id,
      title: c.name,
      subtitle: c.phone || 'No phone',
      href: `/customers`,
    })),
    ...materials.map((m) => ({
      type: 'material' as const,
      id: m.id,
      title: m.name,
      subtitle: `Stock: ${m.currentStock} ${m.unit}`,
      href: `/inventory/${m.id}`,
    })),
  ];

  return NextResponse.json({ results });
}
