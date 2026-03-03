'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { createInvoiceAction, addPaymentAction } from '@/lib/actions/invoice-actions';
import { getSession } from '@/lib/session';
import Modal from '@/components/ui/Modal';
import { formatDate } from '@/types';
import WhatsAppShare from '@/components/ui/WhatsAppShare';

interface Invoice {
  id: number;
  invoiceNo: string;
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalAmount: number;
  paidAmount: number;
  status: string;
  dueDate: Date | string | null;
  createdAt: Date | string;
  customer: { id: number; name: string };
  _count: { payments: number };
}

interface Customer { id: number; name: string; }

const STATUS_COLORS: Record<string, string> = {
  unpaid: 'bg-red-100 text-red-700',
  partial: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-green-100 text-green-700',
  overdue: 'bg-red-200 text-red-800',
  cancelled: 'bg-gray-100 text-gray-600',
};

export default function InvoicesClient({ invoices, customers }: { invoices: Invoice[]; customers: Customer[] }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  async function handleCreateSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const session = getSession();
    if (session) fd.set('factoryId', String(session.factoryId));
    const result = await createInvoiceAction(fd);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Invoice created');
      setCreateOpen(false);
    }
    setSubmitting(false);
  }

  async function handlePayment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    fd.set('invoiceId', String(selectedInvoiceId));
    const result = await addPaymentAction(fd);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Payment recorded');
      setPayOpen(false);
    }
    setSubmitting(false);
  }

  function openPayModal(invoiceId: number) {
    setSelectedInvoiceId(invoiceId);
    setPayOpen(true);
  }

  const totalOutstanding = invoices
    .filter((i) => i.status !== 'paid' && i.status !== 'cancelled')
    .reduce((sum, i) => sum + (i.totalAmount - i.paidAmount), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Invoices</h1>
          {totalOutstanding > 0 && (
            <p className="text-sm text-red-600 mt-1">Outstanding: ₹{totalOutstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          )}
        </div>
        <button onClick={() => setCreateOpen(true)} className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors">
          + New Invoice
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wider">
              <th className="px-4 py-3 font-medium">Invoice No</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Subtotal</th>
              <th className="px-4 py-3 font-medium">GST</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Paid</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Due Date</th>
              <th className="px-4 py-3 font-medium w-28">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv, i) => (
              <tr key={inv.id} className={`border-t border-gray-100 ${i % 2 !== 0 ? 'bg-gray-50/50' : ''}`}>
                <td className="px-4 py-2 font-mono text-accent font-medium">{inv.invoiceNo}</td>
                <td className="px-4 py-2">{inv.customer.name}</td>
                <td className="px-4 py-2">₹{inv.subtotal.toLocaleString('en-IN')}</td>
                <td className="px-4 py-2 text-xs text-gray-500">
                  {inv.igst > 0
                    ? `IGST: ₹${inv.igst.toFixed(2)}`
                    : `CGST: ₹${inv.cgst.toFixed(2)} + SGST: ₹${inv.sgst.toFixed(2)}`
                  }
                </td>
                <td className="px-4 py-2 font-medium">₹{inv.totalAmount.toLocaleString('en-IN')}</td>
                <td className="px-4 py-2">₹{inv.paidAmount.toLocaleString('en-IN')}</td>
                <td className="px-4 py-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[inv.status] || ''}`}>
                    {inv.status}
                  </span>
                </td>
                <td className="px-4 py-2">{formatDate(inv.dueDate)}</td>
                <td className="px-4 py-2">
                  <div className="flex gap-1 flex-wrap">
                    {inv.status !== 'paid' && inv.status !== 'cancelled' && (
                      <button
                        onClick={() => openPayModal(inv.id)}
                        className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded hover:bg-green-100 transition-colors"
                      >
                        Pay
                      </button>
                    )}
                    <a
                      href={`/invoices/${inv.id}/print`}
                      target="_blank"
                      className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
                    >
                      Print
                    </a>
                    <WhatsAppShare
                      text={`Invoice ${inv.invoiceNo}\nCustomer: ${inv.customer.name}\nTotal: ₹${inv.totalAmount.toLocaleString('en-IN')}\nPaid: ₹${inv.paidAmount.toLocaleString('en-IN')}\nBalance: ₹${(inv.totalAmount - inv.paidAmount).toLocaleString('en-IN')}\nDue: ${formatDate(inv.dueDate)}`}
                      className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded hover:bg-green-100 transition-colors"
                      label="WA"
                    />
                  </div>
                </td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-12 text-center text-gray-400">No invoices yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create Invoice Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New Invoice" wide>
        <form onSubmit={handleCreateSubmit} className="space-y-4">
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
            <label className="block text-sm font-medium mb-1">Subtotal (before GST) *</label>
            <input type="number" name="subtotal" step="0.01" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="0.00" />
            <p className="text-xs text-gray-400 mt-1">GST (18%) will be auto-calculated based on customer state</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Due Date</label>
            <input type="date" name="dueDate" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea name="notes" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" rows={2} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting} className="bg-accent text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50">
              {submitting ? 'Creating...' : 'Create Invoice'}
            </button>
            <button type="button" onClick={() => setCreateOpen(false)} className="border border-gray-300 px-5 py-2 rounded-lg text-sm">Cancel</button>
          </div>
        </form>
      </Modal>

      {/* Record Payment Modal */}
      <Modal open={payOpen} onClose={() => setPayOpen(false)} title="Record Payment">
        <form onSubmit={handlePayment} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Amount *</label>
            <input type="number" name="amount" step="0.01" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="0.00" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Payment Mode</label>
            <select name="mode" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="neft">NEFT/RTGS</option>
              <option value="cheque">Cheque</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Reference</label>
            <input type="text" name="reference" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="UPI Ref / Cheque No / Transaction ID" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea name="notes" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" rows={2} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting} className="bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50">
              {submitting ? 'Recording...' : 'Record Payment'}
            </button>
            <button type="button" onClick={() => setPayOpen(false)} className="border border-gray-300 px-5 py-2 rounded-lg text-sm">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
