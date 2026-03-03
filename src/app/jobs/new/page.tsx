import { getCustomerDropdown } from '@/lib/db/customers';
import NewJobForm from './NewJobForm';

export default async function NewJobPage() {
  const customers = await getCustomerDropdown();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Create New Job</h1>
      <NewJobForm customers={customers} />
    </div>
  );
}
