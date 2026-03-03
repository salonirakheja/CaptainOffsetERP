import Link from 'next/link';
import { getAllCustomers } from '@/lib/db/customers';
import { formatDate } from '@/types';
import NewCustomerModal from './NewCustomerModal';

export const dynamic = 'force-dynamic';

export default async function CustomersPage() {
  const customers = await getAllCustomers();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Customers</h1>
        <NewCustomerModal />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wider">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Total Jobs</th>
              <th className="px-4 py-3 font-medium">Last Order</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c, i) => (
              <tr key={c.id} className={`border-t border-gray-100 hover:bg-gray-50 transition-colors ${i % 2 !== 0 ? 'bg-gray-50/50' : ''}`}>
                <td className="px-4 py-3">
                  <Link href={`/customers/${c.id}`} className="text-accent font-medium hover:underline">
                    {c.name}
                  </Link>
                </td>
                <td className="px-4 py-3">{c.phone || '—'}</td>
                <td className="px-4 py-3">{c.email || '—'}</td>
                <td className="px-4 py-3">{c._count.jobs}</td>
                <td className="px-4 py-3">{c.jobs[0] ? formatDate(c.jobs[0].createdAt) : '—'}</td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400">No customers yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
