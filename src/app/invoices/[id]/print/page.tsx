import { prisma } from '@/lib/db/prisma';
import { formatDate } from '@/types';
import { notFound } from 'next/navigation';
import PrintButton from '@/components/ui/PrintButton';

export const dynamic = 'force-dynamic';

export default async function PrintInvoicePage({ params }: { params: { id: string } }) {
  const invoiceId = parseInt(params.id);
  if (isNaN(invoiceId)) return notFound();

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      customer: true,
      factory: true,
      payments: { orderBy: { paidAt: 'desc' } },
    },
  });

  if (!invoice) return notFound();

  const factory = invoice.factory;
  const amountInWords = numberToWords(invoice.totalAmount);

  return (
    <div className="max-w-[210mm] mx-auto bg-white p-8 print:p-6 text-sm text-gray-800">
      {/* Print styles */}
      <style>{`
        @media print {
          body { margin: 0; padding: 0; }
          @page { size: A4; margin: 15mm; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Header */}
      <div className="text-center border-b-2 border-gray-800 pb-4 mb-4">
        <h1 className="text-2xl font-bold uppercase tracking-wide">{factory?.name || 'Captain Offset Press'}</h1>
        <p className="text-xs text-gray-500 mt-1">{factory?.address || 'B-18, Sector-58, Noida, UP'}</p>
        {factory?.gstin && <p className="text-xs text-gray-500">GSTIN: {factory.gstin}</p>}
        {factory?.phone && <p className="text-xs text-gray-500">Ph: {factory.phone}</p>}
      </div>

      {/* Title */}
      <div className="text-center mb-4">
        <h2 className="text-lg font-bold uppercase border border-gray-800 inline-block px-6 py-1">Tax Invoice</h2>
      </div>

      {/* Invoice Info */}
      <div className="flex justify-between mb-4">
        <div>
          <p><span className="font-medium">Invoice No:</span> {invoice.invoiceNo}</p>
          <p><span className="font-medium">Date:</span> {formatDate(invoice.createdAt)}</p>
        </div>
        <div className="text-right">
          {invoice.dueDate && (
            <p><span className="font-medium">Due Date:</span> {formatDate(invoice.dueDate)}</p>
          )}
          <p><span className="font-medium">Status:</span> <span className="uppercase">{invoice.status}</span></p>
        </div>
      </div>

      {/* Billed To */}
      <div className="border border-gray-300 rounded p-3 mb-6">
        <p className="font-medium text-xs text-gray-500 uppercase mb-1">Billed To</p>
        <p className="font-medium text-base">{invoice.customer.name}</p>
        {invoice.customer.address && <p className="text-xs">{invoice.customer.address}</p>}
        {invoice.customer.gstin && <p className="text-xs">GSTIN: {invoice.customer.gstin}</p>}
        {invoice.customer.phone && <p className="text-xs">Ph: {invoice.customer.phone}</p>}
      </div>

      {/* Amount Table */}
      <table className="w-full border-collapse border border-gray-400 mb-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-400 px-3 py-2 text-left text-xs font-medium">Description</th>
            <th className="border border-gray-400 px-3 py-2 text-right text-xs font-medium">Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-gray-400 px-3 py-2">Subtotal</td>
            <td className="border border-gray-400 px-3 py-2 text-right">{invoice.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          </tr>
          {invoice.igst > 0 ? (
            <tr>
              <td className="border border-gray-400 px-3 py-2">IGST (18%)</td>
              <td className="border border-gray-400 px-3 py-2 text-right">{invoice.igst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            </tr>
          ) : (
            <>
              <tr>
                <td className="border border-gray-400 px-3 py-2">CGST (9%)</td>
                <td className="border border-gray-400 px-3 py-2 text-right">{invoice.cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td className="border border-gray-400 px-3 py-2">SGST (9%)</td>
                <td className="border border-gray-400 px-3 py-2 text-right">{invoice.sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              </tr>
            </>
          )}
          <tr className="font-bold bg-gray-50">
            <td className="border border-gray-400 px-3 py-2">Total</td>
            <td className="border border-gray-400 px-3 py-2 text-right">₹{invoice.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          </tr>
        </tbody>
      </table>

      {/* Amount in Words */}
      <p className="text-xs mb-6"><span className="font-medium">Amount in Words:</span> {amountInWords}</p>

      {/* Payment History */}
      {invoice.payments.length > 0 && (
        <div className="mb-6">
          <p className="font-medium text-xs text-gray-500 uppercase mb-2">Payment History</p>
          <table className="w-full border-collapse border border-gray-300 text-xs">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-2 py-1 text-left">Date</th>
                <th className="border border-gray-300 px-2 py-1 text-right">Amount</th>
                <th className="border border-gray-300 px-2 py-1 text-left">Mode</th>
                <th className="border border-gray-300 px-2 py-1 text-left">Reference</th>
              </tr>
            </thead>
            <tbody>
              {invoice.payments.map((p) => (
                <tr key={p.id}>
                  <td className="border border-gray-300 px-2 py-1">{formatDate(p.paidAt)}</td>
                  <td className="border border-gray-300 px-2 py-1 text-right">₹{p.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="border border-gray-300 px-2 py-1 uppercase">{p.mode}</td>
                  <td className="border border-gray-300 px-2 py-1">{p.reference || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-between mt-2 text-xs font-medium">
            <span>Paid: ₹{invoice.paidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            <span>Balance: ₹{(invoice.totalAmount - invoice.paidAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      )}

      {/* Notes */}
      {invoice.notes && (
        <div className="mb-6">
          <p className="font-medium text-xs text-gray-500 uppercase mb-1">Notes</p>
          <p className="text-xs">{invoice.notes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-between mt-12 pt-8">
        <div>
          <p className="text-xs text-gray-400">This is a computer generated invoice.</p>
        </div>
        <div className="text-center">
          <div className="border-t border-gray-400 w-40 pt-1">
            <p className="text-xs text-gray-500">Authorized Signatory</p>
          </div>
        </div>
      </div>

      {/* Print Button */}
      <div className="no-print mt-8 text-center">
        <PrintButton label="Print Invoice" />
      </div>
    </div>
  );
}

function numberToWords(num: number): string {
  if (num === 0) return 'Zero';
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const whole = Math.floor(num);
  const paise = Math.round((num - whole) * 100);

  function convert(n: number): string {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + convert(n % 100) : '');
    if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');
    if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convert(n % 100000) : '');
    return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convert(n % 10000000) : '');
  }

  let result = 'Rupees ' + convert(whole);
  if (paise > 0) result += ' and ' + convert(paise) + ' Paise';
  result += ' Only';
  return result;
}
