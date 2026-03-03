import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getMaterialById } from '@/lib/db/materials';
import { getStockLedger } from '@/lib/db/stock-ledger';
import { formatDateTime, formatJobId } from '@/types';

export const dynamic = 'force-dynamic';

export default async function StockLedgerPage({ params }: { params: { id: string } }) {
  const materialId = parseInt(params.id);
  if (isNaN(materialId)) return notFound();

  const material = await getMaterialById(materialId);
  if (!material) return notFound();

  const ledger = await getStockLedger(materialId);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/inventory" className="text-gray-400 hover:text-gray-600">&larr;</Link>
        <h1 className="text-2xl font-bold">{material.name}</h1>
        <span className="text-sm text-gray-400 capitalize">{material.category} &middot; {material.unit}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Current Stock</p>
          <p className="text-2xl font-bold">{material.currentStock} {material.unit}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Reorder Level</p>
          <p className="text-2xl font-bold">{material.reorderLevel} {material.unit}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Entries</p>
          <p className="text-2xl font-bold">{ledger.length}</p>
        </div>
      </div>

      <h2 className="text-lg font-semibold mb-3">Stock Ledger</h2>
      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wider">
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Quantity</th>
              <th className="px-4 py-3 font-medium">Balance</th>
              <th className="px-4 py-3 font-medium">Job Ref</th>
              <th className="px-4 py-3 font-medium">Logged By</th>
              <th className="px-4 py-3 font-medium">Notes</th>
            </tr>
          </thead>
          <tbody>
            {ledger.map((entry, i) => (
              <tr key={entry.id} className={`border-t border-gray-100 ${i % 2 !== 0 ? 'bg-gray-50/50' : ''}`}>
                <td className="px-4 py-2">{formatDateTime(entry.createdAt)}</td>
                <td className="px-4 py-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    entry.entryType === 'inward' ? 'bg-green-100 text-green-700' :
                    entry.entryType === 'wastage' ? 'bg-red-100 text-red-700' :
                    entry.entryType === 'adjustment' ? 'bg-purple-100 text-purple-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {entry.entryType}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <span className={entry.entryType === 'inward' || entry.entryType === 'adjustment' ? 'text-green-600' : 'text-red-600'}>
                    {entry.entryType === 'inward' || entry.entryType === 'adjustment' ? '+' : '-'}{entry.quantity}
                  </span>
                </td>
                <td className="px-4 py-2 font-medium">{entry.balanceAfter}</td>
                <td className="px-4 py-2">
                  {entry.job ? (
                    <Link href={`/jobs/${entry.job.id}`} className="text-accent hover:underline font-mono text-xs">
                      {formatJobId(entry.job.id)}
                    </Link>
                  ) : '—'}
                </td>
                <td className="px-4 py-2">{entry.loggedBy?.name || '—'}</td>
                <td className="px-4 py-2 text-gray-400">{entry.referenceNote || '—'}</td>
              </tr>
            ))}
            {ledger.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No entries yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
