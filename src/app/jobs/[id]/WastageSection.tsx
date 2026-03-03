'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { logWastageAction } from '@/lib/actions/material-actions';
import Modal from '@/components/ui/Modal';

interface Material { id: number; name: string; unit: string; currentStock: number; }
interface Person { id: number; name: string; role: string; }

export default function WastageSection({ jobId, materials, people }: { jobId: number; materials: Material[]; people: Person[] }) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    fd.set('jobId', String(jobId));
    const result = await logWastageAction(fd);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Wastage logged');
      setOpen(false);
    }
    setSubmitting(false);
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Wastage</h2>
        <button onClick={() => setOpen(true)} className="text-sm text-accent font-medium hover:underline">
          + Log Wastage
        </button>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Log Wastage">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Material *</label>
            <select name="materialId" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="">Select material...</option>
              {materials.map((m) => (
                <option key={m.id} value={m.id}>{m.name} ({m.currentStock} {m.unit})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Quantity *</label>
            <input type="number" name="quantity" step="any" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Logged By *</label>
            <select name="loggedBy" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="">Select person...</option>
              {people.map((p) => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea name="referenceNote" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" rows={2} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting} className="bg-accent text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50">
              {submitting ? 'Logging...' : 'Log Wastage'}
            </button>
            <button type="button" onClick={() => setOpen(false)} className="border border-gray-300 px-5 py-2 rounded-lg text-sm">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
