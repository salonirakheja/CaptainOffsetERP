'use client';

export default function PrintButton({ label = 'Print' }: { label?: string }) {
  return (
    <button
      onClick={() => window.print()}
      className="bg-accent text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 no-print"
    >
      {label}
    </button>
  );
}
