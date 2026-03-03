'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { createGateLogAction, markExitAction } from '@/lib/actions/gate-log-actions';
import { getSession } from '@/lib/session';
import Modal from '@/components/ui/Modal';
import { formatDateTime } from '@/types';

interface GateLogEntry {
  id: number;
  entryType: string;
  personName: string;
  vehicle: string;
  purpose: string;
  material: string;
  quantity: string;
  entryTime: Date | string;
  exitTime: Date | string | null;
  loggedBy: { id: number; name: string };
  notes: string;
}

const ENTRY_TYPE_LABELS: Record<string, string> = {
  visitor: 'Visitor',
  vehicle_in: 'Vehicle In',
  vehicle_out: 'Vehicle Out',
  material_in: 'Material In',
  material_out: 'Material Out',
  worker: 'Worker',
};

const ENTRY_TYPE_COLORS: Record<string, string> = {
  visitor: 'bg-blue-100 text-blue-700',
  vehicle_in: 'bg-green-100 text-green-700',
  vehicle_out: 'bg-orange-100 text-orange-700',
  material_in: 'bg-purple-100 text-purple-700',
  material_out: 'bg-red-100 text-red-700',
  worker: 'bg-gray-100 text-gray-700',
};

export default function GateLogClient({ entries }: { entries: GateLogEntry[] }) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const session = getSession();
    if (session) {
      fd.set('factoryId', String(session.factoryId));
      fd.set('loggedById', String(session.personId));
    }
    const result = await createGateLogAction(fd);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Gate entry logged');
      setOpen(false);
    }
    setSubmitting(false);
  }

  async function handleMarkExit(id: number) {
    const result = await markExitAction(id);
    if (result.success) {
      toast.success('Exit time recorded');
    }
  }

  const activeCount = entries.filter((e) => !e.exitTime).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Gate Log</h1>
          <p className="text-sm text-gray-500 mt-1">Today&apos;s entries &middot; {activeCount} currently inside</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
        >
          + Log Entry
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wider">
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Person/Name</th>
              <th className="px-4 py-3 font-medium">Vehicle</th>
              <th className="px-4 py-3 font-medium">Purpose</th>
              <th className="px-4 py-3 font-medium">Material</th>
              <th className="px-4 py-3 font-medium">Entry Time</th>
              <th className="px-4 py-3 font-medium">Exit Time</th>
              <th className="px-4 py-3 font-medium">Logged By</th>
              <th className="px-4 py-3 font-medium w-20"></th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, i) => (
              <tr key={entry.id} className={`border-t border-gray-100 ${i % 2 !== 0 ? 'bg-gray-50/50' : ''}`}>
                <td className="px-4 py-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ENTRY_TYPE_COLORS[entry.entryType] || 'bg-gray-100 text-gray-700'}`}>
                    {ENTRY_TYPE_LABELS[entry.entryType] || entry.entryType}
                  </span>
                </td>
                <td className="px-4 py-2 font-medium">{entry.personName}</td>
                <td className="px-4 py-2">{entry.vehicle || '—'}</td>
                <td className="px-4 py-2">{entry.purpose || '—'}</td>
                <td className="px-4 py-2">{entry.material ? `${entry.material} (${entry.quantity})` : '—'}</td>
                <td className="px-4 py-2">{formatDateTime(entry.entryTime)}</td>
                <td className="px-4 py-2">{entry.exitTime ? formatDateTime(entry.exitTime) : <span className="text-green-600 font-medium">Inside</span>}</td>
                <td className="px-4 py-2">{entry.loggedBy.name}</td>
                <td className="px-4 py-2">
                  {!entry.exitTime && (
                    <button
                      onClick={() => handleMarkExit(entry.id)}
                      className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded hover:bg-red-100 transition-colors"
                    >
                      Mark Exit
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-12 text-center text-gray-400">No gate entries today</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Log Gate Entry" wide>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Entry Type *</label>
            <select name="entryType" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="">Select type...</option>
              <option value="visitor">Visitor</option>
              <option value="vehicle_in">Vehicle In</option>
              <option value="vehicle_out">Vehicle Out</option>
              <option value="material_in">Material In</option>
              <option value="material_out">Material Out</option>
              <option value="worker">Worker</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Person / Name *</label>
            <input type="text" name="personName" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Name of visitor/driver/worker" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Vehicle Number</label>
            <input type="text" name="vehicle" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="e.g. UP 78 AB 1234" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Purpose</label>
            <input type="text" name="purpose" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Delivery, pickup, meeting..." />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Material</label>
              <input type="text" name="material" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Material type" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Quantity</label>
              <input type="text" name="quantity" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="e.g. 50 bundles" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea name="notes" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" rows={2} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting} className="bg-accent text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50">
              {submitting ? 'Logging...' : 'Log Entry'}
            </button>
            <button type="button" onClick={() => setOpen(false)} className="border border-gray-300 px-5 py-2 rounded-lg text-sm">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
