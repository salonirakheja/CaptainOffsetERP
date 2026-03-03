'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { createQuotationAction, updateQuotationStatusAction } from '@/lib/actions/quotation-actions';
import { getSession } from '@/lib/session';
import Modal from '@/components/ui/Modal';
import { formatDate } from '@/types';

interface Quotation {
  id: number;
  quotationNo: string;
  totalAmount: number;
  status: string;
  validUntil: Date | string | null;
  createdAt: Date | string;
  customer: { id: number; name: string };
  createdBy: { id: number; name: string };
  _count: { jobs: number };
}

interface Customer { id: number; name: string; }

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  sent: 'bg-blue-100 text-blue-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  expired: 'bg-yellow-100 text-yellow-700',
};

export default function QuotationsClient({ quotations, customers }: { quotations: Quotation[]; customers: Customer[] }) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [items, setItems] = useState([{ description: '', qty: '', rate: '' }]);

  function addItem() {
    setItems([...items, { description: '', qty: '', rate: '' }]);
  }

  function updateItem(i: number, field: string, value: string) {
    const updated = [...items];
    updated[i] = { ...updated[i], [field]: value };
    setItems(updated);
  }

  function removeItem(i: number) {
    if (items.length <= 1) return;
    setItems(items.filter((_, idx) => idx !== i));
  }

  const total = items.reduce((sum, item) => {
    return sum + (parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0);
  }, 0);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const session = getSession();
    if (session) {
      fd.set('factoryId', String(session.factoryId));
      fd.set('createdById', String(session.personId));
    }
    fd.set('items', JSON.stringify(items));
    fd.set('totalAmount', String(total));

    const result = await createQuotationAction(fd);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Quotation created');
      setOpen(false);
      setItems([{ description: '', qty: '', rate: '' }]);
    }
    setSubmitting(false);
  }

  async function handleStatusChange(id: number, status: string) {
    await updateQuotationStatusAction(id, status);
    toast.success('Status updated');
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Quotations</h1>
        <button onClick={() => setOpen(true)} className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors">
          + New Quotation
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wider">
              <th className="px-4 py-3 font-medium">Quotation No</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Valid Until</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 font-medium">Jobs</th>
              <th className="px-4 py-3 font-medium w-32">Actions</th>
            </tr>
          </thead>
          <tbody>
            {quotations.map((q, i) => (
              <tr key={q.id} className={`border-t border-gray-100 ${i % 2 !== 0 ? 'bg-gray-50/50' : ''}`}>
                <td className="px-4 py-2 font-mono text-accent font-medium">{q.quotationNo}</td>
                <td className="px-4 py-2">{q.customer.name}</td>
                <td className="px-4 py-2">₹{q.totalAmount.toLocaleString('en-IN')}</td>
                <td className="px-4 py-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[q.status] || ''}`}>
                    {q.status}
                  </span>
                </td>
                <td className="px-4 py-2">{formatDate(q.validUntil)}</td>
                <td className="px-4 py-2">{formatDate(q.createdAt)}</td>
                <td className="px-4 py-2">{q._count.jobs}</td>
                <td className="px-4 py-2">
                  {q.status === 'draft' && (
                    <button onClick={() => handleStatusChange(q.id, 'sent')} className="text-xs text-blue-600 hover:underline mr-2">
                      Mark Sent
                    </button>
                  )}
                  {q.status === 'sent' && (
                    <>
                      <button onClick={() => handleStatusChange(q.id, 'accepted')} className="text-xs text-green-600 hover:underline mr-2">
                        Accept
                      </button>
                      <button onClick={() => handleStatusChange(q.id, 'rejected')} className="text-xs text-red-600 hover:underline">
                        Reject
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {quotations.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400">No quotations yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="New Quotation" wide>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Customer *</label>
            <select name="customerId" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="">Select customer...</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Line Items</label>
              <button type="button" onClick={addItem} className="text-accent text-xs font-medium hover:underline">+ Add Item</button>
            </div>
            <div className="space-y-2">
              {items.map((item, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateItem(i, 'description', e.target.value)}
                    placeholder="Description"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                  <input
                    type="number"
                    value={item.qty}
                    onChange={(e) => updateItem(i, 'qty', e.target.value)}
                    placeholder="Qty"
                    className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    step="any"
                  />
                  <input
                    type="number"
                    value={item.rate}
                    onChange={(e) => updateItem(i, 'rate', e.target.value)}
                    placeholder="Rate"
                    className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    step="0.01"
                  />
                  <span className="text-sm text-gray-500 w-20 text-right">₹{((parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0)).toFixed(2)}</span>
                  {items.length > 1 && (
                    <button type="button" onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600">&times;</button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-sm font-medium text-right mt-2">Total: ₹{total.toFixed(2)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Valid Until</label>
            <input type="date" name="validUntil" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea name="notes" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" rows={2} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting} className="bg-accent text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50">
              {submitting ? 'Creating...' : 'Create Quotation'}
            </button>
            <button type="button" onClick={() => setOpen(false)} className="border border-gray-300 px-5 py-2 rounded-lg text-sm">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
