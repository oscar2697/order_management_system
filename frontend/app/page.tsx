import Link from 'next/link';
import { apiFetch, type Customer, type Order, type Paginated, type Product } from './lib/api';

export default async function HomePage() {
  const [customers, products, orders] = await Promise.all([
    apiFetch<Paginated<Customer>>('/customers?limit=1'),
    apiFetch<Paginated<Product>>('/products?limit=1'),
    apiFetch<Paginated<Order>>('/orders?limit=1'),
  ]);

  const cards = [
    { href: '/customers', title: 'Clientes', total: customers.meta.total, desc: 'Crear y gestionar clientes' },
    { href: '/products', title: 'Productos', total: products.meta.total, desc: 'Catálogo y precios' },
    { href: '/orders', title: 'Órdenes', total: orders.meta.total, desc: 'Crear, completar y cancelar órdenes' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Panel principal</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-400"
          >
            <p className="text-sm text-gray-500">{c.title}</p>
            <p className="mt-1 text-3xl font-semibold">{c.total}</p>
            <p className="mt-2 text-sm text-gray-500">{c.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
