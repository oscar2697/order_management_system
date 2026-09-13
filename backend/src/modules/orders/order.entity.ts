import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Customer } from '../customers/customer.entity';
import { decimalToNumber } from '../products/product.entity';
import { OrderItem } from './order-item.entity';

export const ORDER_STATUSES = ['pending', 'completed', 'cancelled'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

/**
 * Allowed status transitions. `completed` and `cancelled` are terminal:
 * a finished order is never reopened, and a cancelled one is never resumed.
 */
export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Customer, (customer) => customer.orders, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({ name: 'customer_id' })
  customerId: number;

  @Index()
  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: OrderStatus;

  /**
   * Persisted (not computed on read) because item prices are a snapshot
   * taken at creation time — the total must never change retroactively.
   */
  @Column({ type: 'decimal', precision: 12, scale: 2, transformer: decimalToNumber })
  total: number;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
