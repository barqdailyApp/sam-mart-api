import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
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
import { I18nResponse } from 'src/core/helpers/i18n.helper';
import { DriverShipmentsQuery } from './filter/driver-shipment.query';
import { ShipmentResponse } from './dto/response/shipment.response';
import { ShipmentDriverResponse } from './dto/response/driver-response/shipment-driver.respnse';
import { SingleOrderQuery } from './filter/single-order.query';

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
  constructor(
    private readonly orderService: OrderService,
    @Inject(I18nResponse) private readonly _i18nResponse: I18nResponse,
  ) {}
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
    const data = this._i18nResponse.entity(ordersResponse);

    const pageDto = new PageDto(data, pageMetaDto);

    return new ActionResponse(pageDto);
  }

  @Get('single-client-order/:order_id')
  async getSingleClientOrder(@Param('order_id') order_id: string) {
    const order = await this.orderService.getSingleOrder(order_id);

    const orderResponse = plainToClass(OrderResponse, order);
    return new ActionResponse(orderResponse);
  }

  @Get('driver-shipments')
  async getDriverOrders(@Query() driverShipmentsQuery: DriverShipmentsQuery) {
    const { page, limit } = driverShipmentsQuery;

    const { orders, total } = await this.orderService.getDriverShipments(
      driverShipmentsQuery,
    );

    const shipmentsResponse = orders.map((order) => {
      const shipmentResponse = plainToClass(ShipmentDriverResponse, order);

      return shipmentResponse;
    });
    const pageMetaDto = new PageMetaDto(page, limit, total);
    const data = this._i18nResponse.entity(shipmentsResponse);

    const pageDto = new PageDto(data, pageMetaDto);

    return new ActionResponse(pageDto);
  }

  @Get('single-shipment/:shipment_id')
  async getSingleShipment(@Param('shipment_id') shipment_id: string) {
    const shipment = await this.orderService.getSingleShipment(shipment_id);

    const shipmentResponse = plainToClass(ShipmentResponse, shipment);

    return new ActionResponse(shipmentResponse);
  }
}
