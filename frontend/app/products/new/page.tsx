import { createProduct } from '../../lib/actions';
import { ProductForm } from '../product-form';

export default function NewProductPage() {
  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">Nuevo producto</h1>
      <ProductForm action={createProduct} />
    </div>
  );
}
