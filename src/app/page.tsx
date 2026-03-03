import Link from 'next/link';
import { getDashboardStats } from '@/lib/db/dashboard';
import { getActiveJobs } from '@/lib/db/jobs';
import { getLowStockMaterials } from '@/lib/db/materials';
import { getRecentStockEntries } from '@/lib/db/stock-ledger';
import { getRecentDispatches } from '@/lib/db/dispatch';
import SummaryCard from '@/components/ui/SummaryCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatJobId, formatDate } from '@/types';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const [stats, activeJobs, lowStock, recentStock, recentDispatches] = await Promise.all([
    getDashboardStats(),
    getActiveJobs(),
    getLowStockMaterials(),
    getRecentStockEntries(10),
    getRecentDispatches(5),
  ]);

  const jobsByStatus: Record<string, typeof activeJobs> = {};
  for (const job of activeJobs) {
    if (!jobsByStatus[job.status]) jobsByStatus[job.status] = [];
    jobsByStatus[job.status].push(job);
  }

  const statusOrder = ['pending', 'design', 'ctp_plate', 'printing', 'finishing', 'uv_laminate', 'corrugation', 'pasting', 'ready'];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-3">
          <Link href="/jobs/new" className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors">
            + New Job
          </Link>
          <Link href="/inventory?action=inward" className="bg-white border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            + Log Material Inward
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <SummaryCard title="Active Jobs" value={stats.activeJobs} icon="📋" />
        <SummaryCard title="Due Today" value={stats.jobsDueToday} icon="⏰" />
        <SummaryCard title="Low Stock Items" value={lowStock.length} icon="📦" color={lowStock.length > 0 ? 'bg-red-50' : 'bg-white'} />
        <SummaryCard title="Dispatches Today" value={stats.dispatchesToday} icon="🚚" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Jobs by Status */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold mb-3">Active Jobs</h2>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {statusOrder.map((status) => {
              const jobs = jobsByStatus[status];
              if (!jobs || jobs.length === 0) return null;
              return (
                <div key={status} className="border-b border-gray-100 last:border-0">
                  <div className="px-4 py-2 bg-gray-50 flex items-center gap-2">
                    <StatusBadge status={status} />
                    <span className="text-sm text-gray-500">({jobs.length})</span>
                  </div>
                  {jobs.map((job) => (
                    <Link
                      key={job.id}
                      href={`/jobs/${job.id}`}
                      className="flex items-center gap-4 px-4 py-2.5 hover:bg-gray-50 transition-colors border-t border-gray-50"
                    >
                      <span className="text-sm font-mono font-medium text-accent">{formatJobId(job.id)}</span>
                      <span className="text-sm flex-1">{job.description || job.customer.name}</span>
                      <span className="text-xs text-gray-400">{job.customer.name}</span>
                      {job.dueDate && (
                        <span className="text-xs text-gray-400">{formatDate(job.dueDate)}</span>
                      )}
                    </Link>
                  ))}
                </div>
              );
            })}
            {activeJobs.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8">No active jobs</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Low Stock Alerts */}
          {lowStock.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3">Low Stock Alerts</h2>
              <div className="bg-white rounded-xl border border-red-200 overflow-hidden">
                {lowStock.map((m) => (
                  <Link
                    key={m.id}
                    href={`/inventory/${m.id}`}
                    className="flex items-center justify-between px-4 py-2.5 border-b border-red-50 last:border-0 hover:bg-red-50 transition-colors"
                  >
                    <span className="text-sm">{m.name}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${m.stockStatus === 'critical' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {m.currentStock} {m.unit}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Recent Stock Activity</h2>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {recentStock.map((entry) => (
                <div key={entry.id} className="flex items-center gap-2 px-4 py-2 border-b border-gray-50 last:border-0 text-sm">
                  <span className={`w-1.5 h-1.5 rounded-full ${entry.entryType === 'inward' ? 'bg-green-500' : entry.entryType === 'wastage' ? 'bg-red-500' : 'bg-blue-500'}`}></span>
                  <span className="flex-1 truncate">{entry.material.name}</span>
                  <span className={`text-xs font-medium ${entry.entryType === 'inward' ? 'text-green-600' : 'text-red-600'}`}>
                    {entry.entryType === 'inward' ? '+' : '-'}{entry.quantity}
                  </span>
                </div>
              ))}
              {recentStock.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">No entries yet</p>
              )}
            </div>
          </div>

          {/* Recent Dispatches */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Recent Dispatches</h2>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {recentDispatches.map((d) => (
                <div key={d.id} className="flex items-center gap-2 px-4 py-2 border-b border-gray-50 last:border-0 text-sm">
                  <span className="font-mono text-accent text-xs">{formatJobId(d.job.id)}</span>
                  <span className="flex-1 truncate">{d.customer.name}</span>
                  <span className="text-xs text-gray-400">{formatDate(d.dispatchDate)}</span>
                </div>
              ))}
              {recentDispatches.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">No dispatches yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
