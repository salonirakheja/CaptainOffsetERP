'use client';

import { useState } from 'react';

interface Customer { id: number; name: string; }
interface Material { id: number; name: string; unit: string; }

type ReportType = 'jobs' | 'stock' | 'dispatch';

interface ReportRow {
  [key: string]: string | number;
}

export default function ReportsClient({ customers, materials }: { customers: Customer[]; materials: Material[] }) {
  const [reportType, setReportType] = useState<ReportType>('jobs');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [materialId, setMaterialId] = useState('');
  const [status, setStatus] = useState('');
  const [results, setResults] = useState<ReportRow[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function runReport() {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('type', reportType);
    if (dateFrom) params.set('dateFrom', dateFrom);
    if (dateTo) params.set('dateTo', dateTo);
    if (customerId) params.set('customerId', customerId);
    if (materialId) params.set('materialId', materialId);
    if (status) params.set('status', status);

    const res = await fetch(`/api/reports?${params.toString()}`);
    const data = await res.json();
    setResults(data.rows || []);
    setLoading(false);
  }

  function handlePrint() {
    window.print();
  }

  const columns = results && results.length > 0 ? Object.keys(results[0]) : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Reports</h1>
        {results && results.length > 0 && (
          <button onClick={handlePrint} className="bg-white border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 no-print">
            Print / Export
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 no-print">
        <div className="flex gap-4 mb-4">
          {(['jobs', 'stock', 'dispatch'] as const).map((rt) => (
            <button
              key={rt}
              onClick={() => { setReportType(rt); setResults(null); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                reportType === rt ? 'bg-accent text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {rt === 'jobs' ? 'Jobs Report' : rt === 'stock' ? 'Stock Movement' : 'Dispatch Report'}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-gray-500 mb-1">From</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">To</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>

          {(reportType === 'jobs' || reportType === 'dispatch') && (
            <div>
              <label className="block text-xs text-gray-500 mb-1">Customer</label>
              <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="">All</option>
                {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          )}

          {reportType === 'jobs' && (
            <div>
              <label className="block text-xs text-gray-500 mb-1">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option value="printing">Printing</option>
                <option value="ready">Ready</option>
                <option value="dispatched">Dispatched</option>
              </select>
            </div>
          )}

          {reportType === 'stock' && (
            <div>
              <label className="block text-xs text-gray-500 mb-1">Material</label>
              <select value={materialId} onChange={(e) => setMaterialId(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="">All</option>
                {materials.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
          )}

          <button onClick={runReport} disabled={loading} className="bg-accent text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50">
            {loading ? 'Loading...' : 'Generate Report'}
          </button>
        </div>
      </div>

      {results !== null && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden print-full">
          <div className="px-4 py-3 bg-gray-50 border-b text-sm text-gray-500">
            {results.length} result(s) found
          </div>
          {results.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
                  {columns.map((col) => (
                    <th key={col} className="px-4 py-2 font-medium">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.map((row, i) => (
                  <tr key={i} className={`border-t border-gray-100 ${i % 2 !== 0 ? 'bg-gray-50/50' : ''}`}>
                    {columns.map((col) => (
                      <td key={col} className="px-4 py-2">{String(row[col] ?? '—')}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center text-gray-400 py-8">No data for the selected filters</p>
          )}
        </div>
      )}
    </div>
  );
}
