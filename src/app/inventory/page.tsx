import Link from 'next/link';
import { getAllMaterials } from '@/lib/db/materials';
import InwardModal from './InwardModal';
import NewMaterialModal from './NewMaterialModal';

export const dynamic = 'force-dynamic';

export default async function InventoryPage() {
  const materials = await getAllMaterials();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Inventory</h1>
        <div className="flex gap-3">
          <InwardModal materials={materials} />
          <NewMaterialModal />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wider">
              <th className="px-4 py-3 font-medium">Material</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Unit</th>
              <th className="px-4 py-3 font-medium">Current Stock</th>
              <th className="px-4 py-3 font-medium">Reorder Level</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {materials.map((m, i) => (
              <tr
                key={m.id}
                className={`border-t border-gray-100 transition-colors hover:bg-gray-50 ${
                  m.stockStatus === 'critical' ? 'bg-red-50' : m.stockStatus === 'low' ? 'bg-yellow-50' : i % 2 !== 0 ? 'bg-gray-50/50' : ''
                }`}
              >
                <td className="px-4 py-3">
                  <Link href={`/inventory/${m.id}`} className="text-accent font-medium hover:underline">
                    {m.name}
                  </Link>
                </td>
                <td className="px-4 py-3 capitalize">{m.category}</td>
                <td className="px-4 py-3">{m.unit}</td>
                <td className="px-4 py-3 font-medium">{m.currentStock}</td>
                <td className="px-4 py-3">{m.reorderLevel}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                    m.stockStatus === 'critical' ? 'bg-red-100 text-red-700' :
                    m.stockStatus === 'low' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {m.stockStatus === 'critical' ? 'CRITICAL' : m.stockStatus === 'low' ? 'LOW' : 'OK'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-400 mt-3">{materials.length} material(s)</p>
    </div>
  );
}
