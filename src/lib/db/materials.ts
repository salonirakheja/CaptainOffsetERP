import { prisma } from './prisma';

export async function getAllMaterials() {
  const materials = await prisma.material.findMany({
    include: {
      stockLedgerEntries: true,
    },
    orderBy: { name: 'asc' },
  });

  return materials.map((m) => {
    const inward = m.stockLedgerEntries
      .filter((e) => e.entryType === 'inward' || e.entryType === 'adjustment')
      .reduce((sum, e) => sum + e.quantity, 0);
    const outward = m.stockLedgerEntries
      .filter((e) => e.entryType === 'outward' || e.entryType === 'wastage')
      .reduce((sum, e) => sum + e.quantity, 0);
    const currentStock = inward - outward;

    let stockStatus: 'ok' | 'low' | 'critical' = 'ok';
    if (currentStock < m.reorderLevel) stockStatus = 'critical';
    else if (currentStock < m.reorderLevel * 1.2) stockStatus = 'low';

    return {
      ...m,
      stockLedgerEntries: undefined,
      currentStock,
      stockStatus,
    };
  });
}

export async function getMaterialById(id: number) {
  return prisma.material.findUnique({ where: { id } });
}

export async function createMaterial(data: {
  name: string;
  category: string;
  unit: string;
  reorderLevel: number;
}) {
  return prisma.material.create({ data });
}

export async function getLowStockMaterials() {
  const all = await getAllMaterials();
  return all.filter((m) => m.stockStatus !== 'ok');
}
