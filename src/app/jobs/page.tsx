import Link from 'next/link';
import { getAllJobs } from '@/lib/db/jobs';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatJobId, formatDate } from '@/types';
import JobsFilter from './JobsFilter';

export const dynamic = 'force-dynamic';

export default async function JobsPage({
  searchParams,
}: {
  searchParams: { status?: string; productType?: string; orderType?: string; search?: string };
}) {
  const jobs = await getAllJobs({
    status: searchParams.status || undefined,
    productType: searchParams.productType || undefined,
    orderType: searchParams.orderType || undefined,
    search: searchParams.search || undefined,
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Jobs</h1>
        <Link href="/jobs/new" className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors">
          + New Job
        </Link>
      </div>

      <JobsFilter
        currentStatus={searchParams.status || ''}
        currentProductType={searchParams.productType || ''}
        currentOrderType={searchParams.orderType || ''}
        currentSearch={searchParams.search || ''}
      />

      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-gray-500 text-xs uppercase tracking-wider">
              <th className="px-4 py-3 font-medium">Job ID</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Order Type</th>
              <th className="px-4 py-3 font-medium">Paper Type</th>
              <th className="px-4 py-3 font-medium">Qty</th>
              <th className="px-4 py-3 font-medium">Due Date</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job, i) => (
              <tr key={job.id} className={`border-t border-gray-100 hover:bg-gray-50 transition-colors ${i % 2 === 0 ? '' : 'bg-gray-50/50'}`}>
                <td className="px-4 py-3">
                  <Link href={`/jobs/${job.id}`} className="font-mono text-accent font-medium hover:underline">
                    {formatJobId(job.id)}
                  </Link>
                </td>
                <td className="px-4 py-3">{job.customer.name}</td>
                <td className="px-4 py-3 capitalize">{job.productType === 'box' ? 'Corrugated Box' : 'Printing'}</td>
                <td className="px-4 py-3">{job.orderType === 'job_work' ? 'Job Work (A)' : 'CO Purchase (B)'}</td>
                <td className="px-4 py-3">{job.paperType || '—'}</td>
                <td className="px-4 py-3">{job.quantity} {job.unit}</td>
                <td className="px-4 py-3">{formatDate(job.dueDate)}</td>
                <td className="px-4 py-3"><StatusBadge status={job.status} /></td>
              </tr>
            ))}
            {jobs.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-gray-400">No jobs found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-400 mt-3">{jobs.length} job(s) found</p>
    </div>
  );
}
