import { getAllInvoices } from '@/lib/db/invoices';
import { getCustomerDropdown } from '@/lib/db/customers';
import InvoicesClient from './InvoicesClient';

export const dynamic = 'force-dynamic';

export default async function InvoicesPage() {
  const [invoices, customers] = await Promise.all([
    getAllInvoices(),
    getCustomerDropdown(),
  ]);

  return <InvoicesClient invoices={invoices} customers={customers} />;
}
