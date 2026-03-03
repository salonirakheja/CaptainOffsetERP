import ReportsClient from './ReportsClient';
import { getAllCustomers } from '@/lib/db/customers';
import { getAllMaterials } from '@/lib/db/materials';

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  const [customers, materials] = await Promise.all([
    getAllCustomers(),
    getAllMaterials(),
  ]);

  return (
    <ReportsClient
      customers={customers.map((c) => ({ id: c.id, name: c.name }))}
      materials={materials.map((m) => ({ id: m.id, name: m.name, unit: m.unit }))}
    />
  );
}
