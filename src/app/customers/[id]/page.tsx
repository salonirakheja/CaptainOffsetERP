import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCustomerById } from '@/lib/db/customers';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatJobId, formatDate } from '@/types';

export const dynamic = 'force-dynamic';

export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  if (isNaN(id)) return notFound();

  const customer = await getCustomerById(id);
  if (!customer) return notFound();

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/customers" className="text-gray-400 hover:text-gray-600">&larr;</Link>
        <h1 className="text-2xl font-bold">{customer.name}</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Phone</span>
            <p className="font-medium mt-0.5">{customer.phone || '—'}</p>
          </div>
          <div>
            <span className="text-gray-500">Email</span>
            <p className="font-medium mt-0.5">{customer.email || '—'}</p>
          </div>
          <div>
            <span className="text-gray-500">Address</span>
            <p className="font-medium mt-0.5">{customer.address || '—'}</p>
          </div>
        </div>
      </div>

      <h2 className="text-lg font-semibold mb-3">Jobs ({customer.jobs.length})</h2>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
              <th className="px-4 py-3 font-medium">Job ID</th>
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Due Date</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {customer.jobs.map((job, i) => (
              <tr key={job.id} className={`border-t border-gray-100 ${i % 2 !== 0 ? 'bg-gray-50/50' : ''}`}>
                <td className="px-4 py-2">
                  <Link href={`/jobs/${job.id}`} className="font-mono text-accent font-medium hover:underline">{formatJobId(job.id)}</Link>
                </td>
                <td className="px-4 py-2">{job.description || '—'}</td>
                <td className="px-4 py-2 capitalize">{job.productType === 'box' ? 'Corrugated Box' : 'Printing'}</td>
                <td className="px-4 py-2">{formatDate(job.dueDate)}</td>
                <td className="px-4 py-2"><StatusBadge status={job.status} /></td>
              </tr>
            ))}
            {customer.jobs.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-400">No jobs yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <h2 className="text-lg font-semibold mb-3">Dispatch History ({customer.dispatches.length})</h2>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
              <th className="px-4 py-3 font-medium">Job ID</th>
              <th className="px-4 py-3 font-medium">Qty</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Vehicle/Courier</th>
            </tr>
          </thead>
          <tbody>
            {customer.dispatches.map((d, i) => (
              <tr key={d.id} className={`border-t border-gray-100 ${i % 2 !== 0 ? 'bg-gray-50/50' : ''}`}>
                <td className="px-4 py-2 font-mono text-accent">{formatJobId(d.job.id)}</td>
                <td className="px-4 py-2">{d.quantityDispatched} {d.unit}</td>
                <td className="px-4 py-2">{formatDate(d.dispatchDate)}</td>
                <td className="px-4 py-2">{d.vehicleOrCourier || '—'}</td>
              </tr>
            ))}
            {customer.dispatches.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-400">No dispatches yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
