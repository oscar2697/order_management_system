import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class OrderItemInputDto {
  @IsInt()
  @Min(1)
  productId: number;

  @IsInt()
  @Min(1)
  @Max(10000)
  quantity: number;
}

export class CreateOrderDto {
  @IsInt()
  @Min(1)
  customerId: number;

  @IsArray()
  @ArrayMinSize(1, { message: 'An order must contain at least one product' })
  @ValidateNested({ each: true })
  @Type(() => OrderItemInputDto)
  items: OrderItemInputDto[];
}
