import { IsIn, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { ORDER_STATUSES } from '../order.entity';
import type { OrderStatus } from '../order.entity';

export class ListOrdersDto extends PaginationQueryDto {
  @IsOptional()
  @IsIn(ORDER_STATUSES)
  status?: OrderStatus;
}
