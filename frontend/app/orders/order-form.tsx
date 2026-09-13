'use client';

import { useState } from 'react';
import { createOrder } from '../lib/actions';
import { formatMoney, type Customer, type Product } from '../lib/api';

interface Row {
  productId: number;
  quantity: number;
}

interface Props {
  customers: Customer[];
  products: Product[];
}

export function OrderForm({ customers, products }: Props) {
  const [customerId, setCustomerId] = useState<number | ''>('');
  const [rows, setRows] = useState<Row[]>([{ productId: products[0]?.id ?? 0, quantity: 1 }]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (products.length === 0 || customers.length === 0) {
    return (
      <p className="text-sm text-gray-600">
        Para crear una orden primero necesitas al menos un cliente y un producto.
      </p>
    );
  }

  const priceOf = (id: number) => products.find((p) => p.id === id)?.price ?? 0;
  const total = rows.reduce((acc, r) => acc + priceOf(r.productId) * r.quantity, 0);

  const updateRow = (index: number, patch: Partial<Row>) => {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  };

  const submit = async () => {
    setPending(true);
    setError(null);
    const result = await createOrder({
      customerId: Number(customerId),
      items: rows.map((r) => ({ productId: r.productId, quantity: r.quantity })),
    });
    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
    // on success the server action redirects to /orders
  };

  return (
    <div className="max-w-xl space-y-4">
      {error && (
        <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <div>
        <label htmlFor="customer" className="mb-1 block text-sm font-medium">
          Cliente *
        </label>
        <select
          id="customer"
          value={customerId}
          onChange={(e) => setCustomerId(Number(e.target.value))}
          className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">Seleccionar cliente…</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.email})
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="flex justify-between border-b border-gray-200 px-4 py-2 text-sm font-medium">
          <span>Productos</span>
          <button
            type="button"
            onClick={() => setRows((prev) => [...prev, { productId: products[0].id, quantity: 1 }])}
            className="text-blue-600 hover:underline"
          >
            + Añadir línea
          </button>
        </div>
        {rows.map((row, i) => (
          <div key={i} className="flex items-center gap-3 border-b border-gray-100 px-4 py-2 text-sm last:border-0">
            <select
              value={row.productId}
              onChange={(e) => updateRow(i, { productId: Number(e.target.value) })}
              className="flex-1 rounded border border-gray-300 bg-white px-2 py-1"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {formatMoney(p.price)}
                </option>
              ))}
            </select>
            <input
              type="number" min={1} max={10000} value={row.quantity}
              onChange={(e) => updateRow(i, { quantity: Math.max(1, Number(e.target.value)) })}
              className="w-20 rounded border border-gray-300 px-2 py-1"
            />
            <span className="w-24 text-right text-gray-600">
              {formatMoney(priceOf(row.productId) * row.quantity)}
            </span>
            <button
              type="button"
              disabled={rows.length <= 1}
              onClick={() => setRows((prev) => prev.filter((_, idx) => idx !== i))}
              className="text-red-600 hover:underline disabled:opacity-30"
            >
              Quitar
            </button>
          </div>
        ))}
        <div className="flex justify-end gap-2 px-4 py-3 text-sm font-semibold">
          Total: {formatMoney(total)}
        </div>
      </div>

      <button
        type="button"
        onClick={submit}
        disabled={pending || !customerId || rows.every((r) => !r.productId)}
        className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
      >
        {pending ? 'Creando…' : 'Crear orden'}
      </button>
    </div>
  );
}
