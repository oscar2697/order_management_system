import { IsIn } from 'class-validator';
import { ORDER_STATUSES } from '../order.entity';
import type { OrderStatus } from '../order.entity';

export class UpdateOrderStatusDto {
  @IsIn(ORDER_STATUSES)
  status: OrderStatus;
}
