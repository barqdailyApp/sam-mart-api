import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { MakeOrderRequest } from './dto/make-order-request';
import { ActionResponse } from 'src/core/base/responses/action.response';
import { ApiTags, ApiHeader, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { RolesGuard } from '../authentication/guards/roles.guard';
import { OrderClientQuery } from './filter/order-client.query';
import { plainToClass } from 'class-transformer';
import { OrderResponse } from './dto/response/order.response';
import { PageMetaDto } from 'src/core/helpers/pagination/page-meta.dto';
import { PageDto } from 'src/core/helpers/pagination/page.dto';

@ApiTags('Order')
@ApiHeader({
  name: 'Accept-Language',
  required: false,
  description: 'Language header: en, ar',
})
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}
  @Post()
  async makeOrder(@Body() req: MakeOrderRequest) {
    return new ActionResponse(await this.orderService.makeOrder(req));
  }

  @Get('client-orders')
  async getClientOrders(@Query() orderClientQuery: OrderClientQuery) {
    const { page, limit } = orderClientQuery;
    const { orders, total } = await this.orderService.getAllOrders(
      orderClientQuery,
    );

    const ordersResponse = orders.map((order) => {
      const orderResponse = plainToClass(OrderResponse, order);

      return orderResponse;
    });
    const pageMetaDto = new PageMetaDto(page, limit, total);
    const pageDto = new PageDto(ordersResponse, pageMetaDto);

    return new ActionResponse(pageDto);
  }
}
