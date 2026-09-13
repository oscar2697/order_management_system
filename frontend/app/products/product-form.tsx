'use client';

import { useActionState } from 'react';
import type { FormState } from '../lib/actions';

interface Props {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  defaults?: { name: string; description: string | null; price: number };
}

export function ProductForm({ action, defaults }: Props) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="max-w-md space-y-4">
      {state.error && (
        <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium">
          Nombre *
        </label>
        <input
          id="name" name="name" required minLength={2} maxLength={150}
          defaultValue={defaults?.name}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium">
          Descripción
        </label>
        <textarea
          id="description" name="description" rows={3}
          defaultValue={defaults?.description ?? ''}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label htmlFor="price" className="mb-1 block text-sm font-medium">
          Precio *
        </label>
        <input
          id="price" name="price" type="number" required min="0.01" step="0.01"
          defaultValue={defaults?.price}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      <button
        type="submit" disabled={pending}
        className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
      >
        {pending ? 'Guardando…' : 'Guardar'}
      </button>
    </form>
  );
}
