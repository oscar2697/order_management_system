import { apiFetch, type Customer, type Paginated, type Product } from '../../lib/api';
import { OrderForm } from '../order-form';

export default async function NewOrderPage() {
  const [customers, products] = await Promise.all([
    apiFetch<Paginated<Customer>>('/customers?limit=100'),
    apiFetch<Paginated<Product>>('/products?limit=100'),
  ]);

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">Nueva orden</h1>
      <OrderForm customers={customers.data} products={products.data} />
    </div>
  );
}
