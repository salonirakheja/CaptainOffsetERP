import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed Materials
  const materials = [
    { name: 'Art Paper 90GSM', category: 'paper', unit: 'reels', reorderLevel: 10 },
    { name: 'Art Paper 130GSM', category: 'paper', unit: 'reels', reorderLevel: 10 },
    { name: 'Duplex Board 300GSM', category: 'paper', unit: 'bundles', reorderLevel: 5 },
    { name: 'Duplex Board 350GSM', category: 'paper', unit: 'bundles', reorderLevel: 5 },
    { name: 'Black Ink', category: 'ink', unit: 'kg', reorderLevel: 5 },
    { name: 'Cyan Ink', category: 'ink', unit: 'kg', reorderLevel: 5 },
    { name: 'Magenta Ink', category: 'ink', unit: 'kg', reorderLevel: 5 },
    { name: 'Yellow Ink', category: 'ink', unit: 'kg', reorderLevel: 5 },
    { name: 'UV Chemical', category: 'chemical', unit: 'liters', reorderLevel: 10 },
    { name: 'Lamination Film', category: 'lamination', unit: 'sqm', reorderLevel: 100 },
    { name: 'Varnish', category: 'chemical', unit: 'liters', reorderLevel: 10 },
    { name: 'Flute', category: 'flute', unit: 'bundles', reorderLevel: 20 },
  ];

  for (const m of materials) {
    await prisma.material.create({ data: m });
  }

  // Seed initial stock
  const allMaterials = await prisma.material.findMany();
  for (const m of allMaterials) {
    const qty = m.reorderLevel * 2;
    await prisma.stockLedger.create({
      data: {
        materialId: m.id,
        entryType: 'inward',
        quantity: qty,
        referenceNote: 'Opening stock',
        loggedBy: 'System',
      },
    });
  }

  // Seed People
  const people = [
    { name: 'Tiwari', role: 'dispatch' },
    { name: 'Kamla P', role: 'production' },
    { name: 'Bhagwandas', role: 'store' },
    { name: 'Firoz', role: 'store' },
    { name: 'J. Brar', role: 'production' },
    { name: 'Security Guard', role: 'security' },
  ];

  for (const p of people) {
    await prisma.person.create({ data: p });
  }

  // Seed sample customers
  await prisma.customer.create({
    data: { name: 'Sharma Packaging', phone: '9876543210', address: 'Industrial Area, Phase 2' },
  });
  await prisma.customer.create({
    data: { name: 'Delhi Labels Pvt Ltd', phone: '9812345678', email: 'orders@delhilabels.in', address: 'Naraina, New Delhi' },
  });
  await prisma.customer.create({
    data: { name: 'Gupta Traders', phone: '9988776655', address: 'Sadar Bazaar' },
  });

  console.log('Seed data created successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
