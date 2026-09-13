import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product, decimalToNumber } from '../products/product.entity';
import { Order } from './order.entity';

/**
 * Order line. Name and unit price are snapshots taken at creation time,
 * so later product edits never mutate historical orders (see README).
 */
@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, (order) => order.items, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'order_id' })
  orderId: number;

  /** RESTRICT protects orders: a referenced product cannot be deleted. */
  @ManyToOne(() => Product, (product) => product.orderItems, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'product_id' })
  productId: number;

  /** Snapshot of the product name at purchase time. */
  @Column({ name: 'product_name', length: 150 })
  productName: string;

  @Column({ type: 'int', unsigned: true })
  quantity: number;

  /** Snapshot of the product price at purchase time. */
  @Column({
    name: 'unit_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: decimalToNumber,
  })
  unitPrice: number;
}
