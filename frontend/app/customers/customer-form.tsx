'use client';

import { useActionState } from 'react';
import type { FormState } from '../lib/actions';

interface Props {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  defaults?: { name: string; email: string; phone: string | null };
}

export function CustomerForm({ action, defaults }: Props) {
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
          id="name" name="name" required minLength={2} maxLength={100}
          defaultValue={defaults?.name}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium">
          Email *
        </label>
        <input
          id="email" name="email" type="email" required
          defaultValue={defaults?.email}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label htmlFor="phone" className="mb-1 block text-sm font-medium">
          Teléfono
        </label>
        <input
          id="phone" name="phone"
          defaultValue={defaults?.phone ?? ''}
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
