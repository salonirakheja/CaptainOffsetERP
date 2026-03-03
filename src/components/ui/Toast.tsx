'use client';

import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          fontSize: '14px',
          borderRadius: '8px',
          padding: '12px 16px',
        },
        success: {
          style: { background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' },
        },
        error: {
          style: { background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' },
        },
      }}
    />
  );
}
