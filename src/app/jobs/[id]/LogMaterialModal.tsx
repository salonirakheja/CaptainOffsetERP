'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { logMaterialForJobAction } from '@/lib/actions/production-actions';
import { getPersonIdFromSession } from '@/lib/session';
import Modal from '@/components/ui/Modal';

interface Material { id: number; name: string; unit: string; currentStock: number; }
interface Person { id: number; name: string; role: string; }

export default function LogMaterialModal({ jobId, materials, people }: { jobId: number; materials: Material[]; people: Person[] }) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [materialId, setMaterialId] = useState(0);
  const [entryType, setEntryType] = useState<'outward' | 'wastage'>('outward');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [loggedById, setLoggedById] = useState<number>(0);

  function openModal() {
    setMaterialId(0);
    setEntryType('outward');
    setQuantity('');
    setNotes('');
    setLoggedById(getPersonIdFromSession() || 0);
    setOpen(true);
  }

  async function handleSubmit() {
    if (!materialId) { toast.error('Please select a material'); return; }
    if (!quantity || parseFloat(quantity) <= 0) { toast.error('Please enter a valid quantity'); return; }
    if (!loggedById) { toast.error('Please select who is logging this'); return; }

    setSubmitting(true);
    const result = await logMaterialForJobAction(jobId, materialId, entryType, parseFloat(quantity), notes, loggedById);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`Material ${entryType} logged`);
      setOpen(false);
    }
    setSubmitting(false);
  }

  const selectedMaterial = materials.find((m) => m.id === materialId);

  return (
    <>
      <button onClick={openModal} className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors">
        + Log Materials
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Log Material Usage" wide>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Material *</label>
            <select
              value={materialId}
              onChange={(e) => setMaterialId(parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value={0}>Select material...</option>
              {materials.map((m) => (
                <option key={m.id} value={m.id}>{m.name} (stock: {m.currentStock} {m.unit})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Type *</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" checked={entryType === 'outward'} onChange={() => setEntryType('outward')} className="accent-accent" />
                Outward (used in production)
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" checked={entryType === 'wastage'} onChange={() => setEntryType('wastage')} className="accent-accent" />
                Wastage
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Quantity *</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                step="any"
                placeholder="0"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Unit</label>
              <input
                type="text"
                value={selectedMaterial?.unit || '—'}
                disabled
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500"
              />
            </div>
          </div>

          {selectedMaterial && quantity && parseFloat(quantity) > selectedMaterial.currentStock && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 text-sm text-yellow-700">
              Warning: This will result in negative stock for {selectedMaterial.name} (current: {selectedMaterial.currentStock} {selectedMaterial.unit})
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              rows={2}
              placeholder="e.g. Used for reprinting, extra coating..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Logged By *</label>
            <select
              value={loggedById}
              onChange={(e) => setLoggedById(parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value={0}>Select person...</option>
              {people.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.role})</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-accent text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50"
            >
              {submitting ? 'Logging...' : 'Log Material'}
            </button>
            <button onClick={() => setOpen(false)} className="border border-gray-300 px-5 py-2 rounded-lg text-sm">
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
