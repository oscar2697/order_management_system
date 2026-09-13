import Link from 'next/link';
import { Pagination } from '../components/pagination';
import { apiFetch, formatMoney, type Order, type OrderStatus, type Paginated } from '../lib/api';

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pendiente',
  completed: 'Completada',
  cancelled: 'Cancelada',
};

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { page = '1', status, error } = await searchParams;
  const qs = new URLSearchParams({ page, limit: '10' });
  if (status) qs.set('status', status);
  const orders = await apiFetch<Paginated<Order>>(`/orders?${qs.toString()}`);

  const filters: { label: string; value: string }[] = [
    { label: 'Todas', value: '' },
    { label: 'Pendientes', value: 'pending' },
    { label: 'Completadas', value: 'completed' },
    { label: 'Canceladas', value: 'cancelled' },
  ];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Órdenes</h1>
        <Link href="/orders/new" className="rounded bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700">
          Nueva orden
        </Link>
      </div>

      {error && (
        <p className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <div className="mb-4 flex gap-2">
        {filters.map((f) => (
          <Link
            key={f.value}
            href={f.value ? `/orders?status=${f.value}` : '/orders'}
            className={`rounded-full border px-3 py-1 text-sm ${
              (status ?? '') === f.value
                ? 'border-gray-900 bg-gray-900 text-white'
                : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">#</th>
              <th className="px-4 py-3 font-medium">Cliente</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 text-right font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Fecha</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.data.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  No hay órdenes con este criterio.
                </td>
              </tr>
            )}
            {orders.data.map((o) => (
              <tr key={o.id}>
                <td className="px-4 py-3 text-gray-500">{o.id}</td>
                <td className="px-4 py-3 font-medium">{o.customer?.name ?? `#${o.customerId}`}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[o.status]}`}>
                    {STATUS_LABELS[o.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">{formatMoney(o.total)}</td>
                <td className="px-4 py-3 text-gray-500">{new Date(o.createdAt).toLocaleString('es-ES')}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/orders/${o.id}`} className="text-blue-600 hover:underline">
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        basePath="/orders"
        page={orders.meta.page}
        totalPages={orders.meta.totalPages}
        extraParams={status ? { status } : undefined}
      />
    </div>
  );
}
