import { getAllDispatches } from '@/lib/db/dispatch';
import { getReadyJobs } from '@/lib/db/jobs';
import DispatchPageClient from './DispatchPageClient';

export const dynamic = 'force-dynamic';

export default async function DispatchPage() {
  const [dispatches, readyJobs] = await Promise.all([
    getAllDispatches(),
    getReadyJobs(),
  ]);

  return (
    <DispatchPageClient
      dispatches={dispatches}
      readyJobs={readyJobs}
    />
  );
}
