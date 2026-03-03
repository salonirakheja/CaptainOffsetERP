'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { logInwardAction } from '@/lib/actions/material-actions';
import Modal from '@/components/ui/Modal';

interface Material { id: number; name: string; unit: string; currentStock: number; }

export default function InwardModal({ materials }: { materials: Material[] }) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    fd.set('loggedBy', typeof window !== 'undefined' ? localStorage.getItem('co_user') || '' : '');
    const result = await logInwardAction(fd);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Stock inward logged');
      setOpen(false);
    }
    setSubmitting(false);
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors">
        + Log Inward
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Log Material Inward">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Material *</label>
            <select name="materialId" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="">Select material...</option>
              {materials.map((m) => (
                <option key={m.id} value={m.id}>{m.name} (current: {m.currentStock} {m.unit})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Quantity *</label>
            <input type="number" name="quantity" step="any" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Enter quantity received" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Supplier / Reference</label>
            <input type="text" name="referenceNote" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Supplier name, invoice number, etc." />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting} className="bg-accent text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50">
              {submitting ? 'Logging...' : 'Log Inward'}
            </button>
            <button type="button" onClick={() => setOpen(false)} className="border border-gray-300 px-5 py-2 rounded-lg text-sm">Cancel</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
