import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  DefaultValuePipe,
  Get,
  Inject,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { OrderService } from './order.service';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiHeader,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { Roles } from '../authentication/guards/roles.decorator';
import { RolesGuard } from '../authentication/guards/roles.guard';
import { OrderBookingRequest } from './dto/requests/order-booking-request';
import { ActionResponse } from 'src/core/base/responses/action.response';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';

import { I18nResponse } from 'src/core/helpers/i18n.helper';

import { OrderResponse } from './dto/response/order-response';

import { OrderFinishRequest } from './dto/requests/order-finish.request';
import { UploadValidator } from 'src/core/validators/upload.validator';
import { FileInterceptor } from '@nestjs/platform-express';
import { OrderDetailsResponse } from './dto/response/order-details.response';
import { OrderFilterRequest } from './dto/requests/order-filter.request';

import { CreateCancelOrderRequest } from './dto/requests/create-order-cancel.request';

@ApiBearerAuth()
@ApiHeader({
  name: 'Accept-Language',
  required: false,
  description: 'Language header: en, ar',
})
@ApiTags('Order')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('order')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    @Inject(REQUEST) readonly request: Request,
    @Inject(I18nResponse) private readonly _i18nResponse: I18nResponse,
  ) {}
  @Post()
  async orderBooking(@Body() query: OrderBookingRequest) {
    return new ActionResponse(await this.orderService.orderBooking(query));
  }

  @ApiConsumes('multipart/form-data')
  @Get('all-orders')
  async allOrders(@Query() orderFilterRequest: OrderFilterRequest) {
    const orders = await this.orderService.allOrders(orderFilterRequest);
    console.log(orders);
    const result = await Promise.all(
      orders.map(async (e) => {
        const reschadule_time = (await this.orderService.getAppConstants())
          .reschadule_time;
        const time_difference = Math.abs(
          (new Date(e.order_date).setHours(e.slot.start_time) - new Date().getTime()) /
            (1000 * 60 * 60),
        );
    

        return new OrderResponse({
          ...e,wash_time:(await this.orderService.getAppConstants()).wash_time,
          is_reschedule: ( time_difference >= reschadule_time && e.subscription.reschedule_times>0 ) ? true : false,
        });
      }),
    );
    const data: OrderResponse[] = this._i18nResponse.entity(result);

    return new ActionResponse(data);
  }
  @Get('all-cancel-reasons')
  async getAllCancelReasons() {
    const cancel_reasons = await this.orderService.getAllCancelReasons();
    const data = this._i18nResponse.entity(cancel_reasons);

    return new ActionResponse(data);
  }

  // @Get()
  // async findALL(@Query() query: PaginatedRequest) {
  //   const customer = await this.orderService.findCustomer();
  //   const biker = await this.orderService.getBiker();
  //   applyQueryIncludes(query, 'address');
  //   applyQueryIncludes(query, 'vehicle.color');
  //   applyQueryIncludes(query, 'vehicle.brand_model.brand');
  //   applyQueryIncludes(query, 'vehicle.images');

  //   applyQueryIncludes(query, 'subscription');
  //   applyQueryIncludes(query, 'slot');
  //   applyQueryIncludes(query, 'services');
  //   applyQueryIncludes(query, 'customer.user');
  //   applyQueryIncludes(query, 'biker.user');

  //   if (this.request.user.roles.includes(Role.CLIENT)) {
  //     applyQueryFilters(query, `customer_id=${customer.id}`);
  //   } else {
  //     applyQueryFilters(query, `biker_id=${biker.id}`);
  //   }
  //   const orders = await this.orderService.findAll(query);
  //   const result = orders.map((e) => new OrderResponse({ ...e }));

  //   const resposne = this._i18nResponse.entity(result);
  //   if (query.page && query.limit) {
  //     const total = await this.orderService.count();
  //     return new PaginatedResponse(resposne, { meta: { total, ...query } });
  //   } else return new ActionResponse(resposne);
  // }

  @Roles(Role.BIKER)
  @Post('biker-on-way/:id')
  async bikerOnWay(@Param('id') id: string) {
    const order_details_current = await this.orderService.bikerOnWay(id);
    return new ActionResponse(order_details_current);
  }
  @Roles(Role.BIKER)
  @Post('biker-arrived/:id')
  async bikerArrived(@Param('id') id: string) {
    const order_details_current = await this.orderService.bikerArrived(id);
    return new ActionResponse(order_details_current);
  }
  @Roles(Role.BIKER)
  @Post('start/:id')
  async start(@Param('id') id: string) {
    const order_details_current = await this.orderService.start(id);

    return new ActionResponse(order_details_current);
  }

  @Roles(Role.BIKER)
  @Post('finish/:id')
  async finish(@Param('id') id: string) {
    const order_details_current = await this.orderService.finish(id);

    return new ActionResponse(order_details_current);
  }
  @Roles(Role.BIKER)
  @Post('cancel')
  async cancel(@Body() createCancelOrderRequest: CreateCancelOrderRequest) {
    const order_details_current = await this.orderService.cancel(
      createCancelOrderRequest,
    );

    return new ActionResponse(order_details_current);
  }
  @UseInterceptors(ClassSerializerInterceptor, FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @Roles(Role.BIKER)
  @Post('upload-order-image/:id')
  async uploadOrderImage(
    @Body() orderFinishRequest: OrderFinishRequest,
    @UploadedFile(new UploadValidator().build())
    file: Express.Multer.File,
  ) {
    if (!file) {
      throw new NotFoundException('message.file_not_found');
    }
    orderFinishRequest.file = file;
    const order_details_current = await this.orderService.uploadOrderImage(
      orderFinishRequest,
    );
    return new ActionResponse(order_details_current);
  }
  @Roles(Role.BIKER, Role.CLIENT)
  @Get('single-order-details/:id')
  async singleOrderDetails(@Param('id') id: string) {
    const order_current = await this.orderService.singleOrderDetails(id);

    const order_Dto = new OrderDetailsResponse(order_current,(await this.orderService.getAppConstants()).wash_time);

    const data: OrderDetailsResponse = this._i18nResponse.entity(order_Dto);

    return new ActionResponse(data);
  }

  @Roles(Role.BIKER)
  @Post('service-compelete/:id')
  async compeleteService(@Param('id') id: string) {
    const order_current = await this.orderService.compeleteService(id);

    const data: OrderDetailsResponse = this._i18nResponse.entity(order_current);

    return new ActionResponse(data);
  }

  @Roles(Role.CLIENT)
  @Post('reschedule/:id')
  async reschedule(@Param('id') id: string) {
    const data = await this.orderService.rescheduleOrder(id);

    return new ActionResponse(data);
  }
}
