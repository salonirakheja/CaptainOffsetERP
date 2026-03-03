'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { createDispatchAction } from '@/lib/actions/dispatch-actions';
import { getSession } from '@/lib/session';
import Modal from '@/components/ui/Modal';
import { formatJobId, formatDate } from '@/types';
import WhatsAppShare from '@/components/ui/WhatsAppShare';

interface DispatchRecord {
  id: number;
  quantityDispatched: number;
  unit: string;
  dispatchDate: Date;
  challanNo: string;
  vehicleOrCourier: string;
  receivedBy: string;
  notes: string;
  job: { id: number; description: string; productType: string };
  customer: { id: number; name: string };
  dispatchedBy: { id: number; name: string } | null;
}

interface ReadyJob {
  id: number;
  description: string;
  quantity: number;
  unit: string;
  customerId: number;
  customer: { id: number; name: string };
}

export default function DispatchPageClient({
  dispatches,
  readyJobs,
}: {
  dispatches: DispatchRecord[];
  readyJobs: ReadyJob[];
}) {
  const [open, setOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<ReadyJob | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedJob) return;
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    fd.set('jobId', String(selectedJob.id));
    fd.set('customerId', String(selectedJob.customerId));
    const session = getSession();
    if (session) {
      fd.set('factoryId', String(session.factoryId));
      fd.set('dispatchedById', String(session.personId));
    }
    const result = await createDispatchAction(fd);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Dispatch logged');
      setOpen(false);
      setSelectedJob(null);
    }
    setSubmitting(false);
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dispatch</h1>
        <button
          onClick={() => setOpen(true)}
          disabled={readyJobs.length === 0}
          className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50 transition-colors"
        >
          + New Dispatch
        </button>
      </div>

      {readyJobs.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <p className="text-sm font-medium text-green-700">{readyJobs.length} job(s) ready for dispatch</p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wider">
              <th className="px-4 py-3 font-medium">Challan No</th>
              <th className="px-4 py-3 font-medium">Job ID</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Qty Dispatched</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Vehicle/Courier</th>
              <th className="px-4 py-3 font-medium">Received By</th>
              <th className="px-4 py-3 font-medium">Notes</th>
              <th className="px-4 py-3 font-medium w-28">Actions</th>
            </tr>
          </thead>
          <tbody>
            {dispatches.map((d, i) => (
              <tr key={d.id} className={`border-t border-gray-100 ${i % 2 !== 0 ? 'bg-gray-50/50' : ''}`}>
                <td className="px-4 py-2 font-mono text-xs">{d.challanNo || '—'}</td>
                <td className="px-4 py-2 font-mono text-accent">{formatJobId(d.job.id)}</td>
                <td className="px-4 py-2">{d.customer.name}</td>
                <td className="px-4 py-2">{d.quantityDispatched} {d.unit}</td>
                <td className="px-4 py-2">{formatDate(d.dispatchDate)}</td>
                <td className="px-4 py-2">{d.vehicleOrCourier || '—'}</td>
                <td className="px-4 py-2">{d.receivedBy || '—'}</td>
                <td className="px-4 py-2 text-gray-400">{d.notes || '—'}</td>
                <td className="px-4 py-2">
                  <div className="flex gap-1">
                    {d.challanNo && (
                      <a
                        href={`/dispatch/${encodeURIComponent(d.challanNo)}/print`}
                        target="_blank"
                        className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
                      >
                        Print
                      </a>
                    )}
                    <WhatsAppShare
                      text={`Delivery Challan ${d.challanNo || ''}\nJob: ${formatJobId(d.job.id)}\nCustomer: ${d.customer.name}\nQty: ${d.quantityDispatched} ${d.unit}\nDate: ${formatDate(d.dispatchDate)}\nVehicle: ${d.vehicleOrCourier || 'N/A'}`}
                      className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded hover:bg-green-100 transition-colors"
                      label="WhatsApp"
                    />
                  </div>
                </td>
              </tr>
            ))}
            {dispatches.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-12 text-center text-gray-400">No dispatches yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => { setOpen(false); setSelectedJob(null); }} title="New Dispatch" wide>
        {!selectedJob ? (
          <div className="space-y-2">
            <p className="text-sm text-gray-500 mb-3">Select a ready job to dispatch:</p>
            {readyJobs.map((job) => (
              <button
                key={job.id}
                onClick={() => setSelectedJob(job)}
                className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:border-accent hover:bg-orange-50 transition-colors"
              >
                <span className="font-mono text-accent font-medium">{formatJobId(job.id)}</span>
                <span className="ml-3">{job.customer.name}</span>
                <span className="ml-2 text-gray-400 text-sm">— {job.description}</span>
              </button>
            ))}
            {readyJobs.length === 0 && (
              <p className="text-gray-400 text-center py-4">No jobs ready for dispatch</p>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
              Job: <strong>{formatJobId(selectedJob.id)}</strong> &middot; {selectedJob.customer.name} &middot; {selectedJob.quantity} {selectedJob.unit}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Quantity *</label>
                <input type="number" name="quantityDispatched" step="any" required defaultValue={selectedJob.quantity} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Unit</label>
                <select name="unit" defaultValue={selectedJob.unit} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="pieces">Pieces</option>
                  <option value="sheets">Sheets</option>
                  <option value="reels">Reels</option>
                  <option value="bundles">Bundles</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Dispatch Date</label>
              <input type="date" name="dispatchDate" defaultValue={today} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Vehicle / Courier</label>
              <input type="text" name="vehicleOrCourier" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Received By</label>
              <input type="text" name="receivedBy" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea name="notes" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" rows={2} />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={submitting} className="bg-accent text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50">
                {submitting ? 'Dispatching...' : 'Confirm Dispatch'}
              </button>
              <button type="button" onClick={() => setSelectedJob(null)} className="border border-gray-300 px-5 py-2 rounded-lg text-sm">Back</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
