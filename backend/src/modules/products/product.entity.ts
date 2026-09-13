import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrderItem } from '../orders/order-item.entity';

/** DECIMAL arrives as a string from mysql2; expose it as a number in the API. */
export const decimalToNumber: {
  to: (v: number) => number;
  from: (v: string | null) => number | null;
} = {
  to: (value: number) => value,
  from: (value: string | null) => (value === null ? null : parseFloat(value)),
};

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 150 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: decimalToNumber,
  })
  price: number;

  @OneToMany(() => OrderItem, (item) => item.product)
  orderItems: OrderItem[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
