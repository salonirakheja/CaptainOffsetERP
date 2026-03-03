'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { updateStockEntryAction, deleteStockEntryAction } from '@/lib/actions/production-actions';
import Modal from '@/components/ui/Modal';
import { formatDateTime } from '@/types';

interface StockEntry {
  id: number;
  materialId: number;
  entryType: string;
  quantity: number;
  referenceNote: string;
  loggedBy: string;
  createdAt: Date | string;
  material: { id: number; name: string; unit: string };
}

interface Material { id: number; name: string; unit: string; currentStock: number; }
interface Person { id: number; name: string; role: string; }

export default function MaterialsUsedTable({
  jobId,
  entries,
  materials,
  people,
}: {
  jobId: number;
  entries: StockEntry[];
  materials: Material[];
  people: Person[];
}) {
  // Edit state
  const [editOpen, setEditOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<StockEntry | null>(null);
  const [editMaterialId, setEditMaterialId] = useState(0);
  const [editEntryType, setEditEntryType] = useState<'outward' | 'wastage'>('outward');
  const [editQuantity, setEditQuantity] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editLoggedBy, setEditLoggedBy] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Delete state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteEntry, setDeleteEntry] = useState<StockEntry | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  function openEdit(entry: StockEntry) {
    setEditEntry(entry);
    setEditMaterialId(entry.materialId);
    setEditEntryType(entry.entryType as 'outward' | 'wastage');
    setEditQuantity(String(entry.quantity));
    setEditNotes(entry.referenceNote);
    setEditLoggedBy(entry.loggedBy);
    setEditOpen(true);
  }

  function openDelete(entry: StockEntry) {
    setDeleteEntry(entry);
    setDeleteOpen(true);
  }

  async function handleEditSave() {
    if (!editEntry) return;
    if (!editMaterialId) { toast.error('Please select a material'); return; }
    if (!editQuantity || parseFloat(editQuantity) <= 0) { toast.error('Please enter a valid quantity'); return; }
    if (!editLoggedBy) { toast.error('Please select who logged this'); return; }

    setEditSubmitting(true);
    const result = await updateStockEntryAction(editEntry.id, jobId, {
      materialId: editMaterialId,
      entryType: editEntryType,
      quantity: parseFloat(editQuantity),
      referenceNote: editNotes,
      loggedBy: editLoggedBy,
    });
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Entry updated');
      setEditOpen(false);
    }
    setEditSubmitting(false);
  }

  async function handleDeleteConfirm() {
    if (!deleteEntry) return;
    setDeleteSubmitting(true);
    const result = await deleteStockEntryAction(deleteEntry.id, jobId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Entry deleted — quantity restored to inventory');
      setDeleteOpen(false);
    }
    setDeleteSubmitting(false);
  }

  const editSelectedMaterial = materials.find((m) => m.id === editMaterialId);

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
              <th className="px-4 py-2 font-medium">Material</th>
              <th className="px-4 py-2 font-medium">Type</th>
              <th className="px-4 py-2 font-medium">Quantity</th>
              <th className="px-4 py-2 font-medium">Logged By</th>
              <th className="px-4 py-2 font-medium">Date</th>
              <th className="px-4 py-2 font-medium">Notes</th>
              <th className="px-4 py-2 font-medium w-20"></th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, i) => (
              <tr key={entry.id} className={`border-t border-gray-100 group ${i % 2 === 0 ? '' : 'bg-gray-50/50'}`}>
                <td className="px-4 py-2">{entry.material.name}</td>
                <td className="px-4 py-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${entry.entryType === 'wastage' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                    {entry.entryType}
                  </span>
                </td>
                <td className="px-4 py-2">{entry.quantity} {entry.material.unit}</td>
                <td className="px-4 py-2">{entry.loggedBy}</td>
                <td className="px-4 py-2">{formatDateTime(entry.createdAt)}</td>
                <td className="px-4 py-2 text-gray-400">{entry.referenceNote}</td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(entry)}
                      className="text-gray-400 hover:text-accent transition-colors"
                      title="Edit entry"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => openDelete(entry)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete entry"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        <line x1="10" y1="11" x2="10" y2="17" />
                        <line x1="14" y1="11" x2="14" y2="17" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-6 text-center text-gray-400">No materials logged yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Material Entry" wide>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Material *</label>
            <select
              value={editMaterialId}
              onChange={(e) => setEditMaterialId(parseInt(e.target.value))}
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
                <input type="radio" checked={editEntryType === 'outward'} onChange={() => setEditEntryType('outward')} className="accent-accent" />
                Outward (used in production)
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" checked={editEntryType === 'wastage'} onChange={() => setEditEntryType('wastage')} className="accent-accent" />
                Wastage
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Quantity *</label>
              <input
                type="number"
                value={editQuantity}
                onChange={(e) => setEditQuantity(e.target.value)}
                step="any"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Unit</label>
              <input
                type="text"
                value={editSelectedMaterial?.unit || '—'}
                disabled
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Logged By *</label>
            <select
              value={editLoggedBy}
              onChange={(e) => setEditLoggedBy(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Select person...</option>
              {people.map((p) => (
                <option key={p.id} value={p.name}>{p.name} ({p.role})</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleEditSave}
              disabled={editSubmitting}
              className="bg-accent text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50"
            >
              {editSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
            <button onClick={() => setEditOpen(false)} className="border border-gray-300 px-5 py-2 rounded-lg text-sm">
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Material Entry">
        {deleteEntry && (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm">
              <p className="font-medium text-red-800 mb-2">This will add the quantity back to inventory. Are you sure?</p>
              <div className="text-red-700 space-y-1">
                <p><span className="text-red-500">Material:</span> {deleteEntry.material.name}</p>
                <p><span className="text-red-500">Type:</span> {deleteEntry.entryType}</p>
                <p><span className="text-red-500">Quantity:</span> {deleteEntry.quantity} {deleteEntry.material.unit}</p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteSubmitting}
                className="bg-red-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {deleteSubmitting ? 'Deleting...' : 'Yes, Delete'}
              </button>
              <button onClick={() => setDeleteOpen(false)} className="border border-gray-300 px-5 py-2 rounded-lg text-sm">
                Cancel
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
