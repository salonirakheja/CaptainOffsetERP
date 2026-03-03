'use client';

interface WhatsAppShareProps {
  text: string;
  phone?: string;
  className?: string;
  label?: string;
}

export default function WhatsAppShare({ text, phone, className, label = 'Share on WhatsApp' }: WhatsAppShareProps) {
  function handleClick() {
    const encoded = encodeURIComponent(text);
    const url = phone
      ? `https://wa.me/${phone}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
  }

  return (
    <button
      onClick={handleClick}
      className={className || 'bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors'}
    >
      {label}
    </button>
  );
}
