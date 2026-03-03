'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface SearchResult {
  type: 'job' | 'customer' | 'material';
  id: number;
  title: string;
  subtitle: string;
  href: string;
}

const TYPE_ICONS: Record<string, string> = {
  job: 'J',
  customer: 'C',
  material: 'M',
};

const TYPE_COLORS: Record<string, string> = {
  job: 'bg-accent text-white',
  customer: 'bg-blue-500 text-white',
  material: 'bg-green-500 text-white',
};

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Cmd+K / Ctrl+K to open
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [open]);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.results || []);
      setSelectedIndex(0);
    } catch {
      setResults([]);
    }
    setLoading(false);
  }, []);

  function handleInputChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(value), 200);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      navigate(results[selectedIndex].href);
    }
  }

  function navigate(href: string) {
    setOpen(false);
    window.location.href = href;
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-500 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        <span className="hidden sm:inline">Search...</span>
        <kbd className="hidden sm:inline-block text-xs bg-white border border-gray-300 rounded px-1.5 py-0.5 font-mono">⌘K</kbd>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />

      {/* Search Panel */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Input */}
        <div className="flex items-center border-b border-gray-200 px-4">
          <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search jobs, customers, materials..."
            className="flex-1 px-3 py-3 text-sm outline-none"
          />
          {loading && <div className="w-4 h-4 border-2 border-gray-300 border-t-accent rounded-full animate-spin" />}
          <kbd className="text-xs bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5 font-mono text-gray-400 ml-2">ESC</kbd>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="max-h-80 overflow-y-auto py-2">
            {results.map((r, i) => (
              <button
                key={`${r.type}-${r.id}`}
                onClick={() => navigate(r.href)}
                className={`w-full flex items-center gap-3 px-4 py-2 text-left text-sm transition-colors ${
                  i === selectedIndex ? 'bg-accent/10' : 'hover:bg-gray-50'
                }`}
              >
                <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${TYPE_COLORS[r.type]}`}>
                  {TYPE_ICONS[r.type]}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{r.title}</p>
                  <p className="text-xs text-gray-400 truncate">{r.subtitle}</p>
                </div>
                <span className="text-xs text-gray-300 capitalize">{r.type}</span>
              </button>
            ))}
          </div>
        )}

        {query.length >= 2 && !loading && results.length === 0 && (
          <div className="py-8 text-center text-sm text-gray-400">No results found</div>
        )}

        {query.length < 2 && (
          <div className="py-6 text-center text-xs text-gray-400">
            Type at least 2 characters to search
          </div>
        )}
      </div>
    </div>
  );
}
