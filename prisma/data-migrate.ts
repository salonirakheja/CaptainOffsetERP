/**
 * Data migration script: v1 → v2
 * Run AFTER prisma migrate dev to populate new columns from old data.
 *
 * Usage: npx tsx prisma/data-migrate.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting v2 data migration...');

  // 1. Create default factory if none exists
  let factory = await prisma.factory.findFirst();
  if (!factory) {
    factory = await prisma.factory.create({
      data: {
        name: 'Captain Offset Press',
        code: 'CAPTOFF',
        slug: 'captain-offset',
        address: 'B-18, Sector-58, Noida',
      },
    });
    console.log(`Created factory: ${factory.name} (id=${factory.id})`);
  } else {
    console.log(`Factory already exists: ${factory.name} (id=${factory.id})`);
  }

  // 2. Set factoryId on all Person records + default PIN
  const people = await prisma.person.findMany();
  for (const p of people) {
    await prisma.person.update({
      where: { id: p.id },
      data: {
        factoryId: factory.id,
        pin: p.pin || '1234',
        phone: p.phone || '',
      },
    });
  }
  console.log(`Updated ${people.length} person records with factoryId + PIN`);

  // Build name→id lookup for person mapping
  const allPeople = await prisma.person.findMany();
  const nameToId: Record<string, number> = {};
  for (const p of allPeople) {
    nameToId[p.name.toLowerCase()] = p.id;
  }

  // 3. Set factoryId on Customers
  const customerCount = await prisma.customer.updateMany({
    where: { factoryId: 0 },
    data: { factoryId: factory.id },
  });
  console.log(`Updated ${customerCount.count} customers with factoryId`);

  // 4. Set factoryId on Jobs
  const jobCount = await prisma.job.updateMany({
    where: { factoryId: 0 },
    data: { factoryId: factory.id },
  });
  console.log(`Updated ${jobCount.count} jobs with factoryId`);

  // 5. Set factoryId on Materials + compute currentStock
  const materials = await prisma.material.findMany({
    include: { stockLedgerEntries: true },
  });
  for (const m of materials) {
    const inward = m.stockLedgerEntries
      .filter((e) => e.entryType === 'inward' || e.entryType === 'adjustment')
      .reduce((sum, e) => sum + e.quantity, 0);
    const outward = m.stockLedgerEntries
      .filter((e) => e.entryType === 'outward' || e.entryType === 'wastage')
      .reduce((sum, e) => sum + e.quantity, 0);
    const currentStock = inward - outward;

    await prisma.material.update({
      where: { id: m.id },
      data: { factoryId: factory.id, currentStock },
    });
  }
  console.log(`Updated ${materials.length} materials with factoryId + currentStock`);

  // 6. Set factoryId on Dispatches + generate challanNo
  const dispatches = await prisma.dispatch.findMany({ orderBy: { createdAt: 'asc' } });
  for (let i = 0; i < dispatches.length; i++) {
    const d = dispatches[i];
    const year = new Date(d.createdAt).getFullYear();
    const challanNo = `DC-${year}-${String(i + 1).padStart(4, '0')}`;
    await prisma.dispatch.update({
      where: { id: d.id },
      data: { factoryId: factory.id, challanNo },
    });
  }
  console.log(`Updated ${dispatches.length} dispatches with factoryId + challanNo`);

  // 7. Compute balanceAfter for each StockLedger entry (per material, chronological)
  for (const m of materials) {
    const entries = await prisma.stockLedger.findMany({
      where: { materialId: m.id },
      orderBy: { createdAt: 'asc' },
    });
    let balance = 0;
    for (const e of entries) {
      if (e.entryType === 'inward' || e.entryType === 'adjustment') {
        balance += e.quantity;
      } else {
        balance -= e.quantity;
      }
      await prisma.stockLedger.update({
        where: { id: e.id },
        data: { balanceAfter: balance },
      });
    }
  }
  console.log('Computed balanceAfter for all stock ledger entries');

  // 8. Map loggedBy string → loggedById FK (StockLedger)
  const stockEntries = await prisma.stockLedger.findMany({
    where: { loggedById: null },
  });
  let mappedStock = 0;
  for (const e of stockEntries) {
    // Read raw data — loggedBy column may still exist during migration
    const raw = await prisma.$queryRaw<{ logged_by: string }[]>`
      SELECT logged_by FROM stock_ledger WHERE id = ${e.id}
    `;
    const loggedByName = raw[0]?.logged_by || '';
    if (loggedByName) {
      const personId = nameToId[loggedByName.toLowerCase()];
      if (personId) {
        await prisma.stockLedger.update({
          where: { id: e.id },
          data: { loggedById: personId },
        });
        mappedStock++;
      }
    }
  }
  console.log(`Mapped ${mappedStock}/${stockEntries.length} stock entries loggedBy → loggedById`);

  // 9. Map completedBy string → completedById FK (ProductionStage)
  const stages = await prisma.productionStage.findMany({
    where: { completedById: null },
  });
  let mappedStages = 0;
  for (const s of stages) {
    const raw = await prisma.$queryRaw<{ completed_by: string }[]>`
      SELECT completed_by FROM production_stages WHERE id = ${s.id}
    `;
    const completedByName = raw[0]?.completed_by || '';
    if (completedByName) {
      const personId = nameToId[completedByName.toLowerCase()];
      if (personId) {
        await prisma.productionStage.update({
          where: { id: s.id },
          data: { completedById: personId },
        });
        mappedStages++;
      }
    }
  }
  console.log(`Mapped ${mappedStages}/${stages.length} production stages completedBy → completedById`);

  console.log('\nData migration complete!');
}

main()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
