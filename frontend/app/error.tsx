'use client';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Algo salió mal</h1>
      <p className="text-sm text-gray-600">{error.message}</p>
      <button onClick={reset} className="rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700">
        Reintentar
      </button>
    </div>
  );
}
