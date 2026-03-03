import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getJobById } from '@/lib/db/jobs';
import { getAllMaterials } from '@/lib/db/materials';
import { getActivePeople } from '@/lib/db/people';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatJobId, formatDate, formatDateTime, PRINTING_STAGES, BOX_STAGES, PRIORITY_COLORS } from '@/types';
import ProductionPipeline from './ProductionPipeline';
import LogMaterialModal from './LogMaterialModal';
import MaterialsUsedTable from './MaterialsUsedTable';
import WastageSection from './WastageSection';
import DispatchSection from './DispatchSection';

export const dynamic = 'force-dynamic';

const FINISH_LABELS: Record<string, string> = {
  uv: 'UV Coating',
  varnish: 'Varnish',
  laminate_gloss: 'Laminate (Gloss)',
  laminate_matt: 'Laminate (Matt)',
  foil: 'Foil Stamping',
  emboss: 'Embossing',
};

export default async function JobDetailPage({ params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  if (isNaN(id)) return notFound();

  const [job, materials, people] = await Promise.all([
    getJobById(id),
    getAllMaterials(),
    getActivePeople(),
  ]);

  if (!job) return notFound();

  const stages = job.productType === 'printing' ? PRINTING_STAGES : BOX_STAGES;
  const completedStages = job.productionStages.map((s) => s.stageName);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/jobs" className="text-gray-400 hover:text-gray-600">&larr;</Link>
        <h1 className="text-2xl font-bold">{formatJobId(job.id)}</h1>
        <StatusBadge status={job.status} />
        {job.priority !== 'normal' && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${PRIORITY_COLORS[job.priority] || ''}`}>
            {job.priority}
          </span>
        )}
      </div>

      {/* Job Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8 text-sm">
          <div>
            <span className="text-gray-500">Customer</span>
            <p className="font-medium mt-0.5">{job.customer.name}</p>
          </div>
          <div>
            <span className="text-gray-500">Order Type</span>
            <p className="font-medium mt-0.5">{job.orderType === 'job_work' ? 'Job Work (A)' : 'CO Purchase (B)'}</p>
          </div>
          <div>
            <span className="text-gray-500">Product Type</span>
            <p className="font-medium mt-0.5">{job.productType === 'printing' ? 'Printing' : 'Corrugated Box'}</p>
          </div>
          <div>
            <span className="text-gray-500">Paper Type</span>
            <p className="font-medium mt-0.5">{job.paperType || '—'}{job.gsm ? ` (${job.gsm} GSM)` : ''}</p>
          </div>
          <div>
            <span className="text-gray-500">Quantity</span>
            <p className="font-medium mt-0.5">{job.quantity} {job.unit}</p>
          </div>
          <div>
            <span className="text-gray-500">Due Date</span>
            <p className="font-medium mt-0.5">{formatDate(job.dueDate)}</p>
          </div>
          {(job.sizeWidth || job.sizeHeight) && (
            <div>
              <span className="text-gray-500">Size</span>
              <p className="font-medium mt-0.5">{job.sizeWidth} x {job.sizeHeight} {job.sizeUnit}</p>
            </div>
          )}
          {job.numColors && (
            <div>
              <span className="text-gray-500">Colors</span>
              <p className="font-medium mt-0.5">{job.numColors} color(s), {job.printSides === 'both' ? 'Both Sides' : 'Single Side'}</p>
            </div>
          )}
          {job.finishType && (
            <div>
              <span className="text-gray-500">Finish</span>
              <p className="font-medium mt-0.5">{FINISH_LABELS[job.finishType] || job.finishType}</p>
            </div>
          )}
          {job.productType === 'box' && job.boxLayers && (
            <>
              <div>
                <span className="text-gray-500">Box Config</span>
                <p className="font-medium mt-0.5">{job.boxLayers}-Layer{job.fluteType ? `, ${job.fluteType} Flute` : ''}</p>
              </div>
              {job.boxBoardType && (
                <div>
                  <span className="text-gray-500">Board Type</span>
                  <p className="font-medium mt-0.5">{job.boxBoardType}</p>
                </div>
              )}
            </>
          )}
          {(job.estimatedCost || job.quotedRate) && (
            <div>
              <span className="text-gray-500">Cost / Rate</span>
              <p className="font-medium mt-0.5">
                {job.estimatedCost ? `Est: ₹${job.estimatedCost.toLocaleString('en-IN')}` : ''}
                {job.estimatedCost && job.quotedRate ? ' / ' : ''}
                {job.quotedRate ? `Quoted: ₹${job.quotedRate.toLocaleString('en-IN')}` : ''}
              </p>
            </div>
          )}
          {job.description && (
            <div className="sm:col-span-2 md:col-span-3">
              <span className="text-gray-500">Description</span>
              <p className="font-medium mt-0.5">{job.description}</p>
            </div>
          )}
          {job.notes && (
            <div className="sm:col-span-2 md:col-span-3">
              <span className="text-gray-500">Notes</span>
              <p className="font-medium mt-0.5">{job.notes}</p>
            </div>
          )}
          <div>
            <span className="text-gray-500">Created</span>
            <p className="text-xs text-gray-400 mt-0.5">{formatDateTime(job.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Production Pipeline */}
      {job.status !== 'cancelled' && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Production Pipeline</h2>
          <ProductionPipeline
            jobId={job.id}
            productType={job.productType}
            currentStatus={job.status}
            stages={[...stages]}
            completedStages={completedStages}
            stageRecords={job.productionStages}
            materials={materials}
            people={people}
          />
        </div>
      )}

      {/* Materials Used */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Materials Used</h2>
          {job.status !== 'dispatched' && job.status !== 'cancelled' && (
            <LogMaterialModal jobId={job.id} materials={materials} people={people} />
          )}
        </div>
        <MaterialsUsedTable
          jobId={job.id}
          entries={job.stockLedgerEntries}
          materials={materials}
          people={people}
        />
      </div>

      {/* Wastage */}
      {job.status !== 'dispatched' && job.status !== 'cancelled' && (
        <WastageSection jobId={job.id} materials={materials} people={people} />
      )}

      {/* Dispatch */}
      {(job.status === 'ready' || job.status === 'dispatched') && (
        <DispatchSection
          job={job}
          dispatches={job.dispatches}
        />
      )}
    </div>
  );
}
