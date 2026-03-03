'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { completeStageAction, updateStageAction } from '@/lib/actions/production-actions';
import { STAGE_LABELS } from '@/types';
import Modal from '@/components/ui/Modal';

interface Material { id: number; name: string; unit: string; currentStock: number; }
interface Person { id: number; name: string; role: string; }
interface StageRecord { id: number; stageName: string; completedAt: Date | null; completedBy: string; notes: string; }

interface Props {
  jobId: number;
  productType: string;
  currentStatus: string;
  stages: string[];
  completedStages: string[];
  stageRecords: StageRecord[];
  materials: Material[];
  people: Person[];
}

export default function ProductionPipeline({ jobId, productType, currentStatus, stages, completedStages, stageRecords, materials, people }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeStage, setActiveStage] = useState('');
  const [completedBy, setCompletedBy] = useState('');
  const [notes, setNotes] = useState('');
  const [materialUsage, setMaterialUsage] = useState<{ materialId: number; quantity: number }[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Edit stage state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editStageId, setEditStageId] = useState(0);
  const [editStageName, setEditStageName] = useState('');
  const [editCompletedBy, setEditCompletedBy] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);

  const currentStageIndex = stages.indexOf(currentStatus);
  const needsMaterialPrompt = (stage: string) => {
    if (productType === 'printing') return stage === 'printing' || stage === 'finishing';
    return stage === 'printing' || stage === 'uv_laminate';
  };

  function openMarkComplete(stage: string) {
    setActiveStage(stage);
    setCompletedBy(typeof window !== 'undefined' ? localStorage.getItem('co_user') || '' : '');
    setNotes('');
    setMaterialUsage(needsMaterialPrompt(stage) ? [{ materialId: 0, quantity: 0 }] : []);
    setModalOpen(true);
  }

  function openEditStage(record: StageRecord) {
    setEditStageId(record.id);
    setEditStageName(record.stageName);
    setEditCompletedBy(record.completedBy);
    setEditNotes(record.notes);
    setEditModalOpen(true);
  }

  function addMaterialRow() {
    setMaterialUsage([...materialUsage, { materialId: 0, quantity: 0 }]);
  }

  function removeMaterialRow(index: number) {
    setMaterialUsage(materialUsage.filter((_, i) => i !== index));
  }

  function updateMaterialRow(index: number, field: 'materialId' | 'quantity', value: number) {
    const updated = [...materialUsage];
    updated[index] = { ...updated[index], [field]: value };
    setMaterialUsage(updated);
  }

  async function handleComplete() {
    if (!completedBy) { toast.error('Please select who completed this stage'); return; }
    setSubmitting(true);

    const nextStageIndex = stages.indexOf(activeStage) + 1;
    const nextStatus = nextStageIndex < stages.length ? stages[nextStageIndex] : 'dispatched';
    const validUsage = materialUsage.filter((m) => m.materialId > 0 && m.quantity > 0);

    const result = await completeStageAction(jobId, activeStage, completedBy, notes, nextStatus, validUsage.length > 0 ? validUsage : undefined);
    if (result.success) {
      toast.success(`Stage "${STAGE_LABELS[activeStage] || activeStage}" completed`);
      setModalOpen(false);
    }
    setSubmitting(false);
  }

  async function handleEditSave() {
    if (!editCompletedBy) { toast.error('Completed By is required'); return; }
    setEditSubmitting(true);

    const result = await updateStageAction(editStageId, jobId, editCompletedBy, editNotes);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`Stage "${STAGE_LABELS[editStageName] || editStageName}" updated`);
      setEditModalOpen(false);
    }
    setEditSubmitting(false);
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 overflow-x-auto">
        <div className="flex items-center gap-0 min-w-[600px] md:min-w-0">
          {stages.map((stage, i) => {
            const isCompleted = completedStages.includes(stage) || stages.indexOf(stage) < currentStageIndex;
            const isCurrent = stage === currentStatus;
            const record = stageRecords.find((r) => r.stageName === stage);

            return (
              <div key={stage} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1 relative group">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                      isCompleted
                        ? 'bg-green-500 border-green-500 text-white'
                        : isCurrent
                          ? 'bg-accent border-accent text-white'
                          : 'bg-gray-100 border-gray-300 text-gray-400'
                    }`}
                  >
                    {isCompleted ? '✓' : i + 1}
                  </div>
                  <p className={`text-xs mt-1.5 text-center leading-tight ${isCurrent ? 'font-semibold text-accent' : isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                    {STAGE_LABELS[stage] || stage}
                  </p>
                  {record && record.completedAt && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <p className="text-[10px] text-gray-400">{record.completedBy}</p>
                      <button
                        onClick={() => openEditStage(record)}
                        className="md:opacity-0 md:group-hover:opacity-100 transition-opacity text-gray-400 hover:text-accent"
                        title="Edit stage details"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                    </div>
                  )}
                  {isCurrent && currentStatus !== 'dispatched' && (
                    <button
                      onClick={() => openMarkComplete(stage)}
                      className="mt-2 bg-accent text-white text-xs px-3 py-1 rounded-full hover:bg-orange-600 transition-colors"
                    >
                      Mark Complete
                    </button>
                  )}
                </div>
                {i < stages.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-1 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mark Complete Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={`Complete: ${STAGE_LABELS[activeStage] || activeStage}`} wide>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Completed By *</label>
            <select
              value={completedBy}
              onChange={(e) => setCompletedBy(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Select person...</option>
              {people.map((p) => (
                <option key={p.id} value={p.name}>{p.name} ({p.role})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              rows={2}
            />
          </div>

          {needsMaterialPrompt(activeStage) && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Materials Used</label>
                <button type="button" onClick={addMaterialRow} className="text-accent text-xs font-medium hover:underline">
                  + Add Material
                </button>
              </div>
              <div className="space-y-2">
                {materialUsage.map((row, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <select
                      value={row.materialId}
                      onChange={(e) => updateMaterialRow(i, 'materialId', parseInt(e.target.value))}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    >
                      <option value={0}>Select material...</option>
                      {materials.map((m) => (
                        <option key={m.id} value={m.id}>{m.name} (stock: {m.currentStock} {m.unit})</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={row.quantity || ''}
                      onChange={(e) => updateMaterialRow(i, 'quantity', parseFloat(e.target.value) || 0)}
                      placeholder="Qty"
                      className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      step="any"
                    />
                    {materialUsage.length > 1 && (
                      <button type="button" onClick={() => removeMaterialRow(i)} className="text-red-400 hover:text-red-600 text-lg">&times;</button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1">This will auto-deduct from inventory</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleComplete}
              disabled={submitting}
              className="bg-accent text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Confirm'}
            </button>
            <button onClick={() => setModalOpen(false)} className="border border-gray-300 px-5 py-2 rounded-lg text-sm">
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Stage Modal */}
      <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)} title={`Edit: ${STAGE_LABELS[editStageName] || editStageName}`}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Completed By *</label>
            <select
              value={editCompletedBy}
              onChange={(e) => setEditCompletedBy(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Select person...</option>
              {people.map((p) => (
                <option key={p.id} value={p.name}>{p.name} ({p.role})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              rows={2}
              placeholder="Add or update notes..."
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleEditSave}
              disabled={editSubmitting}
              className="bg-accent text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50"
            >
              {editSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
            <button onClick={() => setEditModalOpen(false)} className="border border-gray-300 px-5 py-2 rounded-lg text-sm">
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
