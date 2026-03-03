'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

interface Props {
  currentStatus: string;
  currentProductType: string;
  currentOrderType: string;
  currentSearch: string;
}

export default function JobsFilter({ currentStatus, currentProductType, currentOrderType, currentSearch }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(currentSearch);

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/jobs?${params.toString()}`);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    updateFilter('search', search);
  }

  return (
    <div className="flex items-center gap-3 mb-4 flex-wrap">
      <select
        value={currentStatus}
        onChange={(e) => updateFilter('status', e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
      >
        <option value="">All Statuses</option>
        <option value="pending">Pending</option>
        <option value="design">Design</option>
        <option value="ctp_plate">CTP/Plate</option>
        <option value="printing">Printing</option>
        <option value="finishing">Finishing</option>
        <option value="ready">Ready</option>
        <option value="dispatched">Dispatched</option>
        <option value="cancelled">Cancelled</option>
      </select>
      <select
        value={currentProductType}
        onChange={(e) => updateFilter('productType', e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
      >
        <option value="">All Products</option>
        <option value="printing">Printing</option>
        <option value="box">Corrugated Box</option>
      </select>
      <select
        value={currentOrderType}
        onChange={(e) => updateFilter('orderType', e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
      >
        <option value="">All Order Types</option>
        <option value="job_work">Job Work (A)</option>
        <option value="co_purchase">CO Purchase (B)</option>
      </select>
      <form onSubmit={handleSearch} className="flex gap-2 ml-auto">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customer or job..."
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-60"
        />
        <button type="submit" className="bg-gray-100 border border-gray-300 px-3 py-2 rounded-lg text-sm hover:bg-gray-200">
          Search
        </button>
      </form>
    </div>
  );
}
