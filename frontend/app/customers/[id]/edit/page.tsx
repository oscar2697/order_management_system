import { notFound } from 'next/navigation';
import { updateCustomer } from '../../../lib/actions';
import { apiFetch, ApiError, type Customer } from '../../../lib/api';
import { CustomerForm } from '../../customer-form';

export default async function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let customer: Customer;
  try {
    customer = await apiFetch<Customer>(`/customers/${id}`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }

  const action = updateCustomer.bind(null, customer.id);

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">Editar cliente</h1>
      <CustomerForm action={action} defaults={customer} />
    </div>
  );
}
