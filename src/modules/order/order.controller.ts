import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { MakeOrderRequest } from './dto/make-order-request';
import { ActionResponse } from 'src/core/base/responses/action.response';
import { ApiTags, ApiHeader, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { RolesGuard } from '../authentication/guards/roles.guard';

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
  constructor( private readonly orderService: OrderService) {}
  @Post()
  async makeOrder(@Body() req: MakeOrderRequest) {
    return new ActionResponse(await this.orderService.makeOrder(req));
  }
}
