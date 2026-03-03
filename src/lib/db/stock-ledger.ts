import { prisma } from './prisma';

export async function getStockLedger(materialId: number) {
  return prisma.stockLedger.findMany({
    where: { materialId },
    include: {
      job: { select: { id: true, description: true } },
      material: true,
      loggedBy: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'asc' },
  });
}

export async function createStockEntry(data: {
  materialId: number;
  entryType: string;
  quantity: number;
  jobId?: number | null;
  referenceNote: string;
  loggedById: number;
}) {
  return prisma.$transaction(async (tx) => {
    // Get current material stock
    const material = await tx.material.findUniqueOrThrow({ where: { id: data.materialId } });
    const delta = (data.entryType === 'inward' || data.entryType === 'adjustment')
      ? data.quantity
      : -data.quantity;
    const newStock = material.currentStock + delta;

    // Create the ledger entry
    const entry = await tx.stockLedger.create({
      data: {
        ...data,
        balanceAfter: newStock,
      },
    });

    // Update material's currentStock
    await tx.material.update({
      where: { id: data.materialId },
      data: { currentStock: newStock },
    });

    return entry;
  });
}

export async function updateStockEntry(id: number, data: {
  materialId: number;
  entryType: string;
  quantity: number;
  referenceNote: string;
  loggedById: number;
}) {
  return prisma.$transaction(async (tx) => {
    // Reverse old entry's effect
    const oldEntry = await tx.stockLedger.findUniqueOrThrow({ where: { id } });
    const oldDelta = (oldEntry.entryType === 'inward' || oldEntry.entryType === 'adjustment')
      ? oldEntry.quantity
      : -oldEntry.quantity;

    // If material changed, restore old material and update new
    if (oldEntry.materialId !== data.materialId) {
      await tx.material.update({
        where: { id: oldEntry.materialId },
        data: { currentStock: { decrement: oldDelta } },
      });
    }

    // Calculate new delta
    const newDelta = (data.entryType === 'inward' || data.entryType === 'adjustment')
      ? data.quantity
      : -data.quantity;

    const targetMaterial = await tx.material.findUniqueOrThrow({ where: { id: data.materialId } });
    const adjustment = oldEntry.materialId === data.materialId
      ? newDelta - oldDelta
      : newDelta;
    const newStock = targetMaterial.currentStock + adjustment;

    const entry = await tx.stockLedger.update({
      where: { id },
      data: {
        ...data,
        balanceAfter: newStock,
      },
    });

    await tx.material.update({
      where: { id: data.materialId },
      data: { currentStock: newStock },
    });

    return entry;
  });
}

export async function deleteStockEntry(id: number) {
  return prisma.$transaction(async (tx) => {
    const entry = await tx.stockLedger.findUniqueOrThrow({ where: { id } });
    const delta = (entry.entryType === 'inward' || entry.entryType === 'adjustment')
      ? entry.quantity
      : -entry.quantity;

    // Restore the stock
    await tx.material.update({
      where: { id: entry.materialId },
      data: { currentStock: { decrement: delta } },
    });

    return tx.stockLedger.delete({ where: { id } });
  });
}

export async function getRecentStockEntries(limit = 10) {
  return prisma.stockLedger.findMany({
    include: {
      material: true,
      job: { select: { id: true, description: true } },
      loggedBy: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}
