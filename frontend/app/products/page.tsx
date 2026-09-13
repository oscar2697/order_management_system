import Link from 'next/link';
import { Pagination } from '../components/pagination';
import { deleteProduct } from '../lib/actions';
import { apiFetch, formatMoney, type Paginated, type Product } from '../lib/api';

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { page = '1', error } = await searchParams;
  const products = await apiFetch<Paginated<Product>>(`/products?page=${page}&limit=10`);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Productos</h1>
        <Link href="/products/new" className="rounded bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700">
          Nuevo producto
        </Link>
      </div>

      {error && (
        <p className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Descripción</th>
              <th className="px-4 py-3 text-right font-medium">Precio</th>
              <th className="px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.data.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                  No hay productos todavía.
                </td>
              </tr>
            )}
            {products.data.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="max-w-xs truncate px-4 py-3 text-gray-500">{p.description ?? '—'}</td>
                <td className="px-4 py-3 text-right">{formatMoney(p.price)}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <Link href={`/products/${p.id}/edit`} className="text-blue-600 hover:underline">
                      Editar
                    </Link>
                    <form action={deleteProduct.bind(null, p.id)}>
                      <button type="submit" className="text-red-600 hover:underline">
                        Eliminar
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination basePath="/products" page={products.meta.page} totalPages={products.meta.totalPages} />
    </div>
  );
}
