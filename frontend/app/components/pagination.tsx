import Link from 'next/link';

interface Props {
  basePath: string;
  page: number;
  totalPages: number;
  /** extra query params to preserve (e.g. status filter) */
  extraParams?: Record<string, string>;
}

export function Pagination({ basePath, page, totalPages, extraParams }: Props) {
  if (totalPages <= 1) return null;

  const href = (p: number) => {
    const params = new URLSearchParams({ ...extraParams, page: String(p) });
    return `${basePath}?${params.toString()}`;
  };

  return (
    <nav className="mt-4 flex items-center justify-between text-sm">
      <span className="text-gray-500">
        Página {page} de {totalPages}
      </span>
      <div className="flex gap-2">
        {page > 1 && (
          <Link className="rounded border border-gray-300 bg-white px-3 py-1 hover:bg-gray-50" href={href(page - 1)}>
            Anterior
          </Link>
        )}
        {page < totalPages && (
          <Link className="rounded border border-gray-300 bg-white px-3 py-1 hover:bg-gray-50" href={href(page + 1)}>
            Siguiente
          </Link>
        )}
      </div>
    </nav>
  );
}
