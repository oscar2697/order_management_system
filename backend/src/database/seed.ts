import 'dotenv/config';
import { AppDataSource } from './data-source';
import { Customer } from '../modules/customers/customer.entity';
import { Product } from '../modules/products/product.entity';
import { OrderItem } from '../modules/orders/order-item.entity';
import { Order } from '../modules/orders/order.entity';

/**
 * Idempotent demo seeder: does nothing if customers already exist.
 * Run locally with `npm run seed`, or inside Docker with
 * `docker compose exec backend node dist/database/seed.js`.
 */
async function seed() {
  await AppDataSource.initialize();

  const customers = AppDataSource.getRepository(Customer);
  const products = AppDataSource.getRepository(Product);
  const orders = AppDataSource.getRepository(Order);

  if ((await customers.count()) > 0) {
    console.log('Seed: data already exists, skipping.');
    await AppDataSource.destroy();
    return;
  }

  const [ada, grace, linus] = await customers.save([
    {
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      phone: '+34 600 111 222',
    },
    {
      name: 'Grace Hopper',
      email: 'grace@example.com',
      phone: '+34 600 333 444',
    },
    { name: 'Linus Torvalds', email: 'linus@example.com' },
  ]);

  const [laptop, mouse, keyboard] = await products.save([
    {
      name: 'Laptop Pro 15"',
      description: 'Portátil de alto rendimiento',
      price: 999.99,
    },
    {
      name: 'Mouse inalámbrico',
      description: 'Mouse ergonómico USB-C',
      price: 25.5,
    },
    {
      name: 'Teclado mecánico',
      description: 'Switches intercambiables',
      price: 89.9,
    },
  ]);

  const makeOrder = (
    customer: Customer,
    items: Array<[Product, number]>,
    status: Order['status'],
  ) => {
    const orderItems = items.map(([product, quantity]) => {
      const item = new OrderItem();
      item.product = product;
      item.productId = product.id;
      item.productName = product.name;
      item.unitPrice = product.price;
      item.quantity = quantity;
      return item;
    });
    const order = new Order();
    order.customer = customer;
    order.customerId = customer.id;
    order.status = status;
    order.items = orderItems;
    const cents = items.reduce(
      (acc, [p, q]) => acc + Math.round(p.price * 100) * q,
      0,
    );
    order.total = cents / 100;
    return order;
  };

  await orders.save([
    makeOrder(
      ada,
      [
        [laptop, 1],
        [mouse, 2],
      ],
      'pending',
    ),
    makeOrder(
      grace,
      [
        [keyboard, 2],
        [mouse, 1],
      ],
      'completed',
    ),
    makeOrder(linus, [[laptop, 1]], 'cancelled'),
  ]);

  console.log('Seed done: 3 customers, 3 products, 3 orders.');
  await AppDataSource.destroy();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
