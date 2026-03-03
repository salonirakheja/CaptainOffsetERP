'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { createMaterialAction } from '@/lib/actions/material-actions';
import Modal from '@/components/ui/Modal';

export default function NewMaterialModal() {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const result = await createMaterialAction(fd);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Material added');
      setOpen(false);
    }
    setSubmitting(false);
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="bg-white border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
        + Add Material
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Add New Material">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input type="text" name="name" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="e.g. Art Paper 150GSM" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category *</label>
            <select name="category" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="">Select...</option>
              <option value="paper">Paper</option>
              <option value="ink">Ink</option>
              <option value="chemical">Chemical</option>
              <option value="lamination">Lamination</option>
              <option value="flute">Flute</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Unit *</label>
            <select name="unit" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="">Select...</option>
              <option value="kg">kg</option>
              <option value="reels">Reels</option>
              <option value="bundles">Bundles</option>
              <option value="liters">Liters</option>
              <option value="sqm">sqm</option>
              <option value="pieces">Pieces</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Reorder Level</label>
            <input type="number" name="reorderLevel" step="any" defaultValue="0" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting} className="bg-accent text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50">
              {submitting ? 'Adding...' : 'Add Material'}
            </button>
            <button type="button" onClick={() => setOpen(false)} className="border border-gray-300 px-5 py-2 rounded-lg text-sm">Cancel</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
