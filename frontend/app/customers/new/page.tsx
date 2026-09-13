import { createCustomer } from '../../lib/actions';
import { CustomerForm } from '../customer-form';

export default function NewCustomerPage() {
  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">Nuevo cliente</h1>
      <CustomerForm action={createCustomer} />
    </div>
  );
}
