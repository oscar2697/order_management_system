import { notFound } from 'next/navigation';
import { updateProduct } from '../../../lib/actions';
import { apiFetch, ApiError, type Product } from '../../../lib/api';
import { ProductForm } from '../../product-form';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let product: Product;
  try {
    product = await apiFetch<Product>(`/products/${id}`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }

  const action = updateProduct.bind(null, product.id);

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">Editar producto</h1>
      <ProductForm action={action} defaults={product} />
    </div>
  );
}
