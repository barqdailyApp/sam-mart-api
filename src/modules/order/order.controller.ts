import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { MakeOrderRequest } from './dto/request/make-order-request';
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

import { ShipmentsTotalDriverResponse } from './dto/response/shipments-driver-total.response';
import { ReturnOrderRequest } from './dto/request/return-order.request';
import { Roles } from '../authentication/guards/roles.decorator';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { UpdateReturnOrderStatusRequest } from './dto/request/update-return-order-statu.request';
import { OrderSingleDashboardResponse } from './dto/response/dashboard-response/order-single-dashboard.response';
import { OrdersDashboardResponse } from './dto/response/dashboard-response/orders-dashboard.response';
import { OrdersTotalDashboardResponse } from './dto/response/dashboard-response/orders-total-dashboard.response';
import { ShipmentsResponse } from './dto/response/client-response/shipments.response';
import { ShipmentSingleResponse } from './dto/response/client-response/shipment-single.response';

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
  ) { }
  @Post()
  async makeOrder(@Body() req: MakeOrderRequest) {
    return new ActionResponse(await this.orderService.makeOrder(req));
  }

  @Get('client-orders')
  async getClientOrders(@Query() orderClientQuery: OrderClientQuery) {
    const { page, limit } = orderClientQuery;
    const { orders, total } = await this.orderService.getAllClientOrders(
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
  @Get('dashboard-orders')
  async getDashboardOrders(@Query() orderClientQuery: OrderClientQuery) {
    const { page, limit } = orderClientQuery;
    const { orders, total } = await this.orderService.getAllDashboardOrders(
      orderClientQuery,
    );

    const ordersResponse = orders.map((order) => {
      //const orderResponse = plainToClass(OrderResponse, order);
      const orderResponse = new OrdersDashboardResponse(order);

      return orderResponse;
    });
    const pageMetaDto = new PageMetaDto(page, limit, total);
    const data = this._i18nResponse.entity(ordersResponse);

    const pageDto = new PageDto(data, pageMetaDto);

    return new ActionResponse(pageDto);
  }
  @Get('dashboard-orders-total')
  async getDashboardOrdersTotal() {
    const ordersTotal = await this.orderService.getTotalDashboardOrders();

    const ordersTotalResponse = new OrdersTotalDashboardResponse(
      ordersTotal.ordersTotal,
      ordersTotal.ordersNew,
      ordersTotal.ordersDriversAccepted,
      ordersTotal.ordersProcessing,
      ordersTotal.ordersPicked,
      ordersTotal.ordersDelivered,
      ordersTotal.ordersCanceled,
    );

    return new ActionResponse(ordersTotalResponse);
  }
  @Get('single-order/:order_id')
  async getSingleClientOrder(@Param('order_id') order_id: string) {
    const order = await this.orderService.getSingleOrder(order_id);

    const orderResponse =  new OrderSingleDashboardResponse(order);

    const data = this._i18nResponse.entity(orderResponse);

    return new ActionResponse(data);
  }

  @Get('dashboard-shipments')
  async getShipmentsDashboard(
    @Query() driverShipmentsQuery: DriverShipmentsQuery,
  ) {
    const { page, limit } = driverShipmentsQuery;

    const { orders, total } = await this.orderService.getDashboardShipments(
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

  @Get('driver-shipments')
  async getDriverShipments(
    @Query() driverShipmentsQuery: DriverShipmentsQuery,
  ) {
    const { page, limit } = driverShipmentsQuery;

    const { orders, total } = await this.orderService.getMyDriverShipments(
      driverShipmentsQuery,
    );
    const shipmentsResponse = orders.map((order) => {
      const shipmentResponse = new ShipmentsResponse(order);

      return shipmentResponse;
    });
    const pageMetaDto = new PageMetaDto(page, limit, total);
    const data = this._i18nResponse.entity(shipmentsResponse);

    const pageDto = new PageDto(data, pageMetaDto);

    return new ActionResponse(pageDto);
  }
  @Get('shipments-driver-total')
  async getTotalDriverShipments() {
    const shipmentsTotal = await this.orderService.getTotalDriverShipments();

    const shipmentsTotalResponse = new ShipmentsTotalDriverResponse(
      shipmentsTotal.ordersNew,
      shipmentsTotal.ordersActive,

      shipmentsTotal.ordersDelivered,
    );

    return new ActionResponse(shipmentsTotalResponse);
  }
  @Get('single-shipment/:shipment_id')
  async getSingleShipment(@Param('shipment_id') shipment_id: string) {
    const shipment = await this.orderService.getSingleShipment(shipment_id);

  const shipmentResponse = new ShipmentSingleResponse(shipment);
    const data = this._i18nResponse.entity(shipmentResponse);

    return new ActionResponse(data);
  }

  @Post("/return-order/:order_id")
  async returnOrder(
    @Param('order_id') order_id: string,
    @Body() req: ReturnOrderRequest
  ) {
    return new ActionResponse(await this.orderService.returnOrder(order_id, req));
  }

  @Roles(Role.ADMIN)
  @Patch("/update-return-order-status/:return_order_id")
  async updateReturnOrderStatus(
    @Param('return_order_id') return_order_id: string,
    @Body() req: UpdateReturnOrderStatusRequest
  ) {
    return new ActionResponse(await this.orderService.updateReturnOrderStatus(return_order_id, req));
  }
}
