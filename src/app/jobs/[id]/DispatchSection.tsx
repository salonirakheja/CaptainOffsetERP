'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { createDispatchAction } from '@/lib/actions/dispatch-actions';
import { getSession } from '@/lib/session';
import Modal from '@/components/ui/Modal';
import { formatJobId, formatDate } from '@/types';

interface Job {
  id: number;
  customerId: number;
  unit: string;
  quantity: number;
  customer: { name: string };
}

interface DispatchRecord {
  id: number;
  quantityDispatched: number;
  unit: string;
  dispatchDate: Date;
  challanNo: string;
  vehicleOrCourier: string;
  receivedBy: string;
  dispatchedBy: { id: number; name: string } | null;
  notes: string;
}

export default function DispatchSection({ job, dispatches }: { job: Job; dispatches: DispatchRecord[] }) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    fd.set('jobId', String(job.id));
    fd.set('customerId', String(job.customerId));
    const session = getSession();
    if (session) {
      fd.set('factoryId', String(session.factoryId));
      fd.set('dispatchedById', String(session.personId));
    }
    const result = await createDispatchAction(fd);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Dispatch logged — job marked as dispatched');
      setOpen(false);
    }
    setSubmitting(false);
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Dispatch</h2>
        {dispatches.length === 0 && (
          <button onClick={() => setOpen(true)} className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600">
            + Dispatch This Job
          </button>
        )}
      </div>

      {dispatches.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
                <th className="px-4 py-2 font-medium">Challan No</th>
                <th className="px-4 py-2 font-medium">Quantity</th>
                <th className="px-4 py-2 font-medium">Date</th>
                <th className="px-4 py-2 font-medium">Vehicle/Courier</th>
                <th className="px-4 py-2 font-medium">Received By</th>
                <th className="px-4 py-2 font-medium">Dispatched By</th>
                <th className="px-4 py-2 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody>
              {dispatches.map((d) => (
                <tr key={d.id} className="border-t border-gray-100">
                  <td className="px-4 py-2 font-mono text-xs">{d.challanNo || '—'}</td>
                  <td className="px-4 py-2">{d.quantityDispatched} {d.unit}</td>
                  <td className="px-4 py-2">{formatDate(d.dispatchDate)}</td>
                  <td className="px-4 py-2">{d.vehicleOrCourier || '—'}</td>
                  <td className="px-4 py-2">{d.receivedBy || '—'}</td>
                  <td className="px-4 py-2">{d.dispatchedBy?.name || '—'}</td>
                  <td className="px-4 py-2 text-gray-400">{d.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={`Dispatch ${formatJobId(job.id)}`} wide>
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
            Customer: <strong>{job.customer.name}</strong> &middot; Qty: {job.quantity} {job.unit}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Quantity Dispatched *</label>
              <input type="number" name="quantityDispatched" step="any" required defaultValue={job.quantity} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Unit</label>
              <select name="unit" defaultValue={job.unit} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
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
            <input type="text" name="vehicleOrCourier" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Vehicle number or courier name" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Received By</label>
            <input type="text" name="receivedBy" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Customer contact name" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea name="notes" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" rows={2} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting} className="bg-accent text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50">
              {submitting ? 'Dispatching...' : 'Confirm Dispatch'}
            </button>
            <button type="button" onClick={() => setOpen(false)} className="border border-gray-300 px-5 py-2 rounded-lg text-sm">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
