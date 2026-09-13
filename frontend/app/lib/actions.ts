'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { apiFetch, type OrderStatus } from './api';

export interface FormState {
  error?: string;
}

function toFormState(e: unknown): FormState {
  return { error: e instanceof Error ? e.message : 'Error inesperado' };
}

// ---------- Customers ----------

export async function createCustomer(_prev: FormState, formData: FormData): Promise<FormState> {
  const phone = String(formData.get('phone') ?? '').trim();
  try {
    await apiFetch('/customers', {
      method: 'POST',
      body: JSON.stringify({
        name: String(formData.get('name') ?? '').trim(),
        email: String(formData.get('email') ?? '').trim(),
        phone: phone || undefined,
      }),
    });
  } catch (e) {
    return toFormState(e);
  }
  revalidatePath('/customers');
  redirect('/customers');
}

export async function updateCustomer(id: number, _prev: FormState, formData: FormData): Promise<FormState> {
  const phone = String(formData.get('phone') ?? '').trim();
  try {
    await apiFetch(`/customers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: String(formData.get('name') ?? '').trim(),
        email: String(formData.get('email') ?? '').trim(),
        phone: phone || null,
      }),
    });
  } catch (e) {
    return toFormState(e);
  }
  revalidatePath('/customers');
  redirect('/customers');
}

export async function deleteCustomer(id: number): Promise<void> {
  try {
    await apiFetch(`/customers/${id}`, { method: 'DELETE' });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error inesperado';
    redirect(`/customers?error=${encodeURIComponent(msg)}`);
  }
  revalidatePath('/customers');
}

// ---------- Products ----------

export async function createProduct(_prev: FormState, formData: FormData): Promise<FormState> {
  const description = String(formData.get('description') ?? '').trim();
  try {
    await apiFetch('/products', {
      method: 'POST',
      body: JSON.stringify({
        name: String(formData.get('name') ?? '').trim(),
        description: description || undefined,
        price: Number(formData.get('price')),
      }),
    });
  } catch (e) {
    return toFormState(e);
  }
  revalidatePath('/products');
  redirect('/products');
}

export async function updateProduct(id: number, _prev: FormState, formData: FormData): Promise<FormState> {
  const description = String(formData.get('description') ?? '').trim();
  try {
    await apiFetch(`/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: String(formData.get('name') ?? '').trim(),
        description: description || null,
        price: Number(formData.get('price')),
      }),
    });
  } catch (e) {
    return toFormState(e);
  }
  revalidatePath('/products');
  redirect('/products');
}

export async function deleteProduct(id: number): Promise<void> {
  try {
    await apiFetch(`/products/${id}`, { method: 'DELETE' });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error inesperado';
    redirect(`/products?error=${encodeURIComponent(msg)}`);
  }
  revalidatePath('/products');
}

// ---------- Orders ----------

export interface CreateOrderInput {
  customerId: number;
  items: { productId: number; quantity: number }[];
}

export async function createOrder(input: CreateOrderInput): Promise<FormState> {
  try {
    await apiFetch('/orders', { method: 'POST', body: JSON.stringify(input) });
  } catch (e) {
    return toFormState(e);
  }
  revalidatePath('/orders');
  redirect('/orders');
}

export async function setOrderStatus(id: number, status: OrderStatus): Promise<void> {
  try {
    await apiFetch(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error inesperado';
    redirect(`/orders/${id}?error=${encodeURIComponent(msg)}`);
  }
  revalidatePath('/orders');
  revalidatePath(`/orders/${id}`);
}
