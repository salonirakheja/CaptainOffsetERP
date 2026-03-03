import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed Factory
  const factory = await prisma.factory.create({
    data: {
      name: 'Captain Offset Press',
      code: 'CAPTOFF',
      slug: 'captain-offset',
      address: 'B-18, Sector-58, Noida',
      phone: '',
      gstin: '',
    },
  });

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
    await prisma.material.create({ data: { ...m, factoryId: factory.id } });
  }

  // Seed People
  const people = [
    { name: 'Tiwari', role: 'dispatch', pin: '1234', phone: '' },
    { name: 'Kamla P', role: 'production', pin: '1234', phone: '' },
    { name: 'Bhagwandas', role: 'store', pin: '1234', phone: '' },
    { name: 'Firoz', role: 'store', pin: '1234', phone: '' },
    { name: 'J. Brar', role: 'production', pin: '1234', phone: '' },
    { name: 'Security Guard', role: 'security', pin: '1234', phone: '' },
  ];

  const createdPeople: { id: number; name: string }[] = [];
  for (const p of people) {
    const person = await prisma.person.create({ data: { ...p, factoryId: factory.id } });
    createdPeople.push(person);
  }

  // Seed initial stock — logged by first person (system)
  const systemPerson = createdPeople[0];
  const allMaterials = await prisma.material.findMany();
  for (const m of allMaterials) {
    const qty = m.reorderLevel * 2;
    await prisma.stockLedger.create({
      data: {
        materialId: m.id,
        entryType: 'inward',
        quantity: qty,
        balanceAfter: qty,
        referenceNote: 'Opening stock',
        loggedById: systemPerson.id,
      },
    });
    await prisma.material.update({
      where: { id: m.id },
      data: { currentStock: qty },
    });
  }

  // Seed sample customers
  await prisma.customer.create({
    data: { name: 'Sharma Packaging', phone: '9876543210', address: 'Industrial Area, Phase 2', gstin: '', state: 'UP', factoryId: factory.id },
  });
  await prisma.customer.create({
    data: { name: 'Delhi Labels Pvt Ltd', phone: '9812345678', email: 'orders@delhilabels.in', address: 'Naraina, New Delhi', gstin: '', state: 'Delhi', factoryId: factory.id },
  });
  await prisma.customer.create({
    data: { name: 'Gupta Traders', phone: '9988776655', address: 'Sadar Bazaar', gstin: '', state: 'UP', factoryId: factory.id },
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
