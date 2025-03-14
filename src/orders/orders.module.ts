import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { envs, ORDER_SERVICE } from 'src/config';

@Module({
  controllers: [OrdersController],
  imports: [
    ClientsModule.register([
      {
        name: ORDER_SERVICE,
        transport: Transport.TCP,
        options: {
          host: envs.ORDERS_MICROSERVICES_HOST,
          port: envs.ORDERS_MICROSERVICES_PORT,
        },
      },
    ]),
  ],
  providers: [OrdersService],
})
export class OrdersModule {}
