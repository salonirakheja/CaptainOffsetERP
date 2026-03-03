import { prisma } from './prisma';

export async function getAllMaterials() {
  const materials = await prisma.material.findMany({
    orderBy: { name: 'asc' },
  });

  return materials.map((m) => {
    let stockStatus: 'ok' | 'low' | 'critical' = 'ok';
    if (m.currentStock < m.reorderLevel) stockStatus = 'critical';
    else if (m.currentStock < m.reorderLevel * 1.2) stockStatus = 'low';

    return {
      ...m,
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
  factoryId: number;
}) {
  return prisma.material.create({ data });
}

export async function getLowStockMaterials() {
  const all = await getAllMaterials();
  return all.filter((m) => m.stockStatus !== 'ok');
}
