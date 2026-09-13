import Link from 'next/link';
import { notFound } from 'next/navigation';
import { setOrderStatus } from '../../lib/actions';
import { apiFetch, ApiError, formatMoney, type Order } from '../../lib/api';

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { id } = await params;
  const { error } = await searchParams;

  let order: Order;
  try {
    order = await apiFetch<Order>(`/orders/${id}`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Orden #{order.id}</h1>
        <Link href="/orders" className="text-sm text-blue-600 hover:underline">
          ← Volver a órdenes
        </Link>
      </div>

      {error && (
        <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm">
          <p className="text-gray-500">Cliente</p>
          <p className="mt-1 font-medium">{order.customer?.name}</p>
          <p className="text-gray-500">{order.customer?.email}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm">
          <p className="text-gray-500">Estado</p>
          <p className="mt-1 font-medium capitalize">{order.status}</p>
          <p className="text-gray-500">Creada: {new Date(order.createdAt).toLocaleString('es-ES')}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Producto</th>
              <th className="px-4 py-3 text-right font-medium">Precio unitario</th>
              <th className="px-4 py-3 text-right font-medium">Cantidad</th>
              <th className="px-4 py-3 text-right font-medium">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {order.items?.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3">{item.productName}</td>
                <td className="px-4 py-3 text-right">{formatMoney(item.unitPrice)}</td>
                <td className="px-4 py-3 text-right">{item.quantity}</td>
                <td className="px-4 py-3 text-right">{formatMoney(item.unitPrice * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-gray-200 font-semibold">
              <td colSpan={3} className="px-4 py-3 text-right">
                Total
              </td>
              <td className="px-4 py-3 text-right">{formatMoney(order.total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {order.status === 'pending' && (
        <div className="flex gap-3">
          <form action={setOrderStatus.bind(null, order.id, 'completed')}>
            <button
              type="submit"
              className="rounded bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-500"
            >
              Marcar como completada
            </button>
          </form>
          <form action={setOrderStatus.bind(null, order.id, 'cancelled')}>
            <button
              type="submit"
              className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500"
            >
              Cancelar orden
            </button>
          </form>
        </div>
      )}
      {order.status !== 'pending' && (
        <p className="text-sm text-gray-500">
          Esta orden está {order.status === 'completed' ? 'completada' : 'cancelada'} y ya no admite cambios de
          estado.
        </p>
      )}
    </div>
  );
}
