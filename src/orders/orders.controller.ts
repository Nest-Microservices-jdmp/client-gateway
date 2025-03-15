import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Inject,
  Query,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { ORDER_SERVICE } from 'src/config';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError, Observable } from 'rxjs';
import { PaginationDto, PaginationStatusDto } from 'src/common';
import { OrderStatus } from './enum/order.enum';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Controller('orders')
export class OrdersController {
  constructor(
    @Inject(ORDER_SERVICE) private readonly orderClient: ClientProxy,
  ) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    console.log(createOrderDto);
    return this.orderClient.send({ cmd: 'create_order' }, createOrderDto).pipe(
      catchError((err) => {
        throw new RpcException(err);
      }),
    );
  }

  @Patch(':id')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() { status }: UpdateOrderStatusDto,
  ): Observable<any> {
    console.log(`Updating order ${id} to status ${status}`);

    return this.orderClient
      .send({ cmd: 'change_order_status' }, { id, status })
      .pipe(
        catchError((err) => {
          throw new RpcException(err);
        }),
      );
  }

  @Get()
  findOrders(@Query() paginationDto: PaginationStatusDto) {
    return this.orderClient.send({ cmd: 'find_orders' }, paginationDto);
  }

  @Get('id/:id')
  findOneOrderById(@Param('id', ParseUUIDPipe) id: string): Observable<any> {
    return this.orderClient.send({ cmd: 'find_one' }, id).pipe(
      catchError((err) => {
        throw new RpcException(err);
      }),
    );
  }
  @Get(':status')
  findStatus(
    @Param('status') status: OrderStatus,
    @Query() paginationDto: PaginationDto,
  ): Observable<any> {
    return this.orderClient
      .send({ cmd: 'find_status' }, { status, ...paginationDto })
      .pipe(
        catchError((err) => {
          throw new RpcException(err);
        }),
      );
  }
}
