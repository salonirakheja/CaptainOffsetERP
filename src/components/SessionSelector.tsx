'use client';

import { useState, useEffect } from 'react';

interface Person {
  id: number;
  name: string;
  role: string;
}

export default function SessionSelector({ people }: { people: Person[] }) {
  const [show, setShow] = useState(false);
  const [current, setCurrent] = useState<string>('');

  useEffect(() => {
    const stored = localStorage.getItem('co_user');
    if (stored) {
      setCurrent(stored);
    } else {
      setShow(true);
    }
  }, []);

  const select = (name: string) => {
    localStorage.setItem('co_user', name);
    setCurrent(name);
    setShow(false);
  };

  if (!show && current) {
    return (
      <button
        onClick={() => setShow(true)}
        className="no-print fixed top-4 right-4 z-50 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm shadow-sm hover:shadow-md transition-shadow flex items-center gap-2"
      >
        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
        {current}
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[200]">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6">
        <h2 className="text-lg font-semibold mb-1">Who are you?</h2>
        <p className="text-sm text-gray-500 mb-4">Select your name to continue</p>
        <div className="space-y-2">
          {people.map((p) => (
            <button
              key={p.id}
              onClick={() => select(p.name)}
              className="w-full text-left px-4 py-2.5 rounded-lg border border-gray-200 hover:border-accent hover:bg-orange-50 transition-colors flex items-center justify-between"
            >
              <span className="font-medium">{p.name}</span>
              <span className="text-xs text-gray-400 capitalize">{p.role}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
