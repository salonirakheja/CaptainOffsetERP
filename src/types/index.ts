export type OrderType = 'job_work' | 'co_purchase';
export type ProductType = 'printing' | 'box';
export type JobStatus = 'pending' | 'design' | 'ctp_plate' | 'printing' | 'finishing' | 'ready' | 'dispatched' | 'cancelled';
export type MaterialCategory = 'paper' | 'ink' | 'chemical' | 'lamination' | 'flute' | 'other';
export type EntryType = 'inward' | 'outward' | 'wastage' | 'adjustment';
export type PersonRole = 'security' | 'store' | 'production' | 'dispatch' | 'design' | 'management';

export const PRINTING_STAGES = ['pending', 'design', 'ctp_plate', 'printing', 'finishing', 'ready', 'dispatched'] as const;
export const BOX_STAGES = ['pending', 'printing', 'uv_laminate', 'corrugation', 'pasting', 'ready', 'dispatched'] as const;

export const STAGE_LABELS: Record<string, string> = {
  pending: 'Pending',
  design: 'Design',
  ctp_plate: 'CTP / Plate',
  printing: 'Printing',
  finishing: 'Finishing (UV/Varnish/Laminate)',
  uv_laminate: 'UV / Laminate',
  corrugation: 'Corrugation',
  pasting: 'Pasting',
  ready: 'Ready',
  dispatched: 'Dispatched',
};

export const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  design: 'bg-blue-100 text-blue-800',
  ctp_plate: 'bg-indigo-100 text-indigo-800',
  printing: 'bg-purple-100 text-purple-800',
  finishing: 'bg-orange-100 text-orange-800',
  uv_laminate: 'bg-orange-100 text-orange-800',
  corrugation: 'bg-amber-100 text-amber-800',
  pasting: 'bg-teal-100 text-teal-800',
  ready: 'bg-green-100 text-green-800',
  dispatched: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
};

export function formatJobId(id: number): string {
  return `CO-${String(id).padStart(4, '0')}`;
}

export function formatDate(date: Date | string | null): string {
  if (!date) return '—';
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(date: Date | string | null): string {
  if (!date) return '—';
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
