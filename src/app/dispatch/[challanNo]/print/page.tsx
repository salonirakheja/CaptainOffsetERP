import { prisma } from '@/lib/db/prisma';
import { formatDate } from '@/types';
import { notFound } from 'next/navigation';
import PrintButton from '@/components/ui/PrintButton';

export const dynamic = 'force-dynamic';

export default async function PrintChallanPage({ params }: { params: { challanNo: string } }) {
  const challanNo = decodeURIComponent(params.challanNo);

  const dispatch = await prisma.dispatch.findFirst({
    where: { challanNo },
    include: {
      job: { select: { id: true, description: true, productType: true, quantity: true, unit: true } },
      customer: true,
      dispatchedBy: { select: { name: true } },
      factory: true,
    },
  });

  if (!dispatch) return notFound();

  const factory = dispatch.factory;

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
      <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
        <h1 className="text-2xl font-bold uppercase tracking-wide">{factory?.name || 'Captain Offset Press'}</h1>
        <p className="text-xs text-gray-500 mt-1">{factory?.address || 'B-18, Sector-58, Noida, UP'}</p>
        {factory?.gstin && <p className="text-xs text-gray-500">GSTIN: {factory.gstin}</p>}
        {factory?.phone && <p className="text-xs text-gray-500">Ph: {factory.phone}</p>}
      </div>

      {/* Title */}
      <div className="text-center mb-6">
        <h2 className="text-lg font-bold uppercase border border-gray-800 inline-block px-6 py-1">Delivery Challan</h2>
      </div>

      {/* Challan Info */}
      <div className="flex justify-between mb-6">
        <div>
          <p><span className="font-medium">Challan No:</span> {dispatch.challanNo}</p>
          <p><span className="font-medium">Date:</span> {formatDate(dispatch.dispatchDate)}</p>
        </div>
        <div className="text-right">
          <p><span className="font-medium">Vehicle/Courier:</span> {dispatch.vehicleOrCourier || '—'}</p>
          <p><span className="font-medium">Dispatched By:</span> {dispatch.dispatchedBy?.name || '—'}</p>
        </div>
      </div>

      {/* Customer Details */}
      <div className="border border-gray-300 rounded p-3 mb-6">
        <p className="font-medium text-xs text-gray-500 uppercase mb-1">Consignee</p>
        <p className="font-medium text-base">{dispatch.customer.name}</p>
        {dispatch.customer.address && <p className="text-xs">{dispatch.customer.address}</p>}
        {dispatch.customer.gstin && <p className="text-xs">GSTIN: {dispatch.customer.gstin}</p>}
        {dispatch.customer.phone && <p className="text-xs">Ph: {dispatch.customer.phone}</p>}
      </div>

      {/* Items Table */}
      <table className="w-full border-collapse border border-gray-400 mb-6">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-400 px-3 py-2 text-left text-xs font-medium">S.No</th>
            <th className="border border-gray-400 px-3 py-2 text-left text-xs font-medium">Description</th>
            <th className="border border-gray-400 px-3 py-2 text-left text-xs font-medium">Product Type</th>
            <th className="border border-gray-400 px-3 py-2 text-right text-xs font-medium">Qty Dispatched</th>
            <th className="border border-gray-400 px-3 py-2 text-left text-xs font-medium">Unit</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-gray-400 px-3 py-2">1</td>
            <td className="border border-gray-400 px-3 py-2">{dispatch.job.description}</td>
            <td className="border border-gray-400 px-3 py-2 capitalize">{dispatch.job.productType}</td>
            <td className="border border-gray-400 px-3 py-2 text-right">{dispatch.quantityDispatched}</td>
            <td className="border border-gray-400 px-3 py-2">{dispatch.unit}</td>
          </tr>
        </tbody>
      </table>

      {/* Notes */}
      {dispatch.notes && (
        <div className="mb-6">
          <p className="font-medium text-xs text-gray-500 uppercase mb-1">Notes</p>
          <p className="text-sm">{dispatch.notes}</p>
        </div>
      )}

      {/* Signatures */}
      <div className="flex justify-between mt-12 pt-8">
        <div className="text-center">
          <div className="border-t border-gray-400 w-40 pt-1">
            <p className="text-xs text-gray-500">Dispatched By</p>
          </div>
        </div>
        <div className="text-center">
          <div className="border-t border-gray-400 w-40 pt-1">
            <p className="text-xs text-gray-500">Received By: {dispatch.receivedBy || '________________'}</p>
          </div>
        </div>
      </div>

      {/* Print Button */}
      <div className="no-print mt-8 text-center">
        <PrintButton label="Print Challan" />
      </div>
    </div>
  );
}
