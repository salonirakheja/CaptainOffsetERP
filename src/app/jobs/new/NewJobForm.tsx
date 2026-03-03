'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { createJobAction } from '@/lib/actions/job-actions';
import { createCustomerAction } from '@/lib/actions/customer-actions';

interface Customer { id: number; name: string; }

export default function NewJobForm({ customers: initialCustomers }: { customers: Customer[] }) {
  const router = useRouter();
  const [customers, setCustomers] = useState(initialCustomers);
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleAddCustomer() {
    if (!newCustomerName.trim()) return;
    const fd = new FormData();
    fd.set('name', newCustomerName.trim());
    const result = await createCustomerAction(fd);
    if (result.success && result.customerId) {
      setCustomers([...customers, { id: result.customerId, name: newCustomerName.trim() }]);
      setNewCustomerName('');
      setShowNewCustomer(false);
      toast.success('Customer added');
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    const fd = new FormData(e.currentTarget);
    const errs: Record<string, string> = {};

    if (!fd.get('customerId')) errs.customerId = 'Required';
    if (!fd.get('orderType')) errs.orderType = 'Required';
    if (!fd.get('productType')) errs.productType = 'Required';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setSubmitting(false);
      return;
    }

    const result = await createJobAction(fd);
    if (result.error) {
      toast.error(result.error);
      setSubmitting(false);
      return;
    }

    toast.success('Job created');
    router.push(`/jobs/${result.jobId}`);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 max-w-2xl">
      <div className="space-y-5">
        {/* Customer */}
        <div>
          <label className="block text-sm font-medium mb-1">Customer *</label>
          <div className="flex gap-2">
            <select name="customerId" className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="">Select customer...</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <button type="button" onClick={() => setShowNewCustomer(!showNewCustomer)} className="text-accent text-sm font-medium hover:underline whitespace-nowrap">
              + New
            </button>
          </div>
          {errors.customerId && <p className="text-red-500 text-xs mt-1">{errors.customerId}</p>}
          {showNewCustomer && (
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={newCustomerName}
                onChange={(e) => setNewCustomerName(e.target.value)}
                placeholder="Customer name"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
              <button type="button" onClick={handleAddCustomer} className="bg-accent text-white px-3 py-2 rounded-lg text-sm">
                Add
              </button>
            </div>
          )}
        </div>

        {/* Order Type */}
        <div>
          <label className="block text-sm font-medium mb-1">Order Type *</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="orderType" value="job_work" className="accent-accent" />
              Job Work (A) — customer supplies paper
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="orderType" value="co_purchase" className="accent-accent" />
              CO Purchase (B) — we buy material
            </label>
          </div>
          {errors.orderType && <p className="text-red-500 text-xs mt-1">{errors.orderType}</p>}
        </div>

        {/* Product Type */}
        <div>
          <label className="block text-sm font-medium mb-1">Product Type *</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="productType" value="printing" className="accent-accent" />
              Printing (Labels, packaging print)
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="productType" value="box" className="accent-accent" />
              Corrugated Box (3-layer / 5-layer)
            </label>
          </div>
          {errors.productType && <p className="text-red-500 text-xs mt-1">{errors.productType}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea name="description" rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Job details, specifications..." />
        </div>

        {/* Paper Type */}
        <div>
          <label className="block text-sm font-medium mb-1">Paper Type</label>
          <input type="text" name="paperType" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="e.g. 90GSM Art Paper, Duplex Board 300GSM" />
        </div>

        {/* Quantity + Unit */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Quantity</label>
            <input type="number" name="quantity" step="any" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="0" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Unit</label>
            <select name="unit" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="pieces">Pieces</option>
              <option value="sheets">Sheets</option>
              <option value="reels">Reels</option>
              <option value="bundles">Bundles</option>
            </select>
          </div>
        </div>

        {/* Due Date */}
        <div>
          <label className="block text-sm font-medium mb-1">Due Date</label>
          <input type="date" name="dueDate" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea name="notes" rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Any additional notes..." />
        </div>
      </div>

      <div className="flex gap-3 mt-6 pt-4 border-t">
        <button
          type="submit"
          disabled={submitting}
          className="bg-accent text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50 transition-colors"
        >
          {submitting ? 'Creating...' : 'Create Job'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="border border-gray-300 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
