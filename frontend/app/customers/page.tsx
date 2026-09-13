import Link from 'next/link';
import { Pagination } from '../components/pagination';
import { deleteCustomer } from '../lib/actions';
import { apiFetch, type Customer, type Paginated } from '../lib/api';

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { page = '1', error } = await searchParams;
  const customers = await apiFetch<Paginated<Customer>>(`/customers?page=${page}&limit=10`);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Clientes</h1>
        <Link href="/customers/new" className="rounded bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700">
          Nuevo cliente
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
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Teléfono</th>
              <th className="px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {customers.data.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                  No hay clientes todavía.
                </td>
              </tr>
            )}
            {customers.data.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3">{c.email}</td>
                <td className="px-4 py-3">{c.phone ?? '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <Link href={`/customers/${c.id}/edit`} className="text-blue-600 hover:underline">
                      Editar
                    </Link>
                    <form action={deleteCustomer.bind(null, c.id)}>
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

      <Pagination basePath="/customers" page={customers.meta.page} totalPages={customers.meta.totalPages} />
    </div>
  );
}
