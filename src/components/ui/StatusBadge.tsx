import { STATUS_COLORS, STAGE_LABELS } from '@/types';

export default function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';
  const label = STAGE_LABELS[status] || status;

  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {label}
    </span>
  );
}
