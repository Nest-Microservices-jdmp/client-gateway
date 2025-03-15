import { IsEnum } from 'class-validator';
import { OrderStatus } from '../enum/order.enum';

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus, {
    message: `Invalid status value. Possible values are: ${Object.values(OrderStatus).join(', ')}`,
  })
  status: OrderStatus;
}
