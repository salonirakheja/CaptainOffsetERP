import { getAllQuotations } from '@/lib/db/quotations';
import { getCustomerDropdown } from '@/lib/db/customers';
import QuotationsClient from './QuotationsClient';

export const dynamic = 'force-dynamic';

export default async function QuotationsPage() {
  const [quotations, customers] = await Promise.all([
    getAllQuotations(),
    getCustomerDropdown(),
  ]);

  return <QuotationsClient quotations={quotations} customers={customers} />;
}
