import { getAllDispatches } from '@/lib/db/dispatch';
import { getReadyJobs } from '@/lib/db/jobs';
import { getActivePeople } from '@/lib/db/people';
import { getCustomerDropdown } from '@/lib/db/customers';
import DispatchPageClient from './DispatchPageClient';

export const dynamic = 'force-dynamic';

export default async function DispatchPage() {
  const [dispatches, readyJobs, people, customers] = await Promise.all([
    getAllDispatches(),
    getReadyJobs(),
    getActivePeople(),
    getCustomerDropdown(),
  ]);

  return (
    <DispatchPageClient
      dispatches={dispatches}
      readyJobs={readyJobs}
      people={people}
      customers={customers}
    />
  );
}
