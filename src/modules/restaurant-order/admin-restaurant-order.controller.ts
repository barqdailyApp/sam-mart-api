import { Body, Controller, Get, Inject, Param, Post, Query, UseGuards } from '@nestjs/common';
import { RestaurantOrderService } from './restaurant-order.service';
import { MakeRestaurantOrderRequest } from './dto/request/make-restaurant-order.request';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { Roles } from '../authentication/guards/roles.decorator';
import { RolesGuard } from '../authentication/guards/roles.guard';
import { plainToInstance } from 'class-transformer';
import { ActionResponse } from 'src/core/base/responses/action.response';
import { RestaurantOrderListResponse } from './dto/response/restaurant-order-list.response';
import { I18nResponse } from 'src/core/helpers/i18n.helper';
import { PaginatedRequest } from 'src/core/base/requests/paginated.request';
import { PaginatedResponse } from 'src/core/base/responses/paginated.response';
import { GetDriverRestaurantOrdersQuery } from './dto/query/get-driver-restaurant-order.query';
import { applyQueryFilters, applyQueryIncludes, applyQuerySort } from 'src/core/helpers/service-related.helper';
@ApiBearerAuth()
@ApiHeader({
  name: 'Accept-Language',
  required: false,
  description: 'Language header: en, ar',
})
@ApiTags('Restaurant-Order')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN,Role.RESTAURANT_ADMIN)
@Controller('restaurant-order')
export class AdminRestaurantOrderController {
    constructor(private readonly restaurantOrderService: RestaurantOrderService
      ,@Inject(I18nResponse) private readonly _i18nResponse: I18nResponse
    ){}
  @Post('/admin/confirm/:id/:restaurant_id')

  async confirmOrder(@Param('id') id:string,@Param('restaurant_id') restaurant_id:string){
    return new ActionResponse(await this.restaurantOrderService.confirmOrder(id));
  }

  @Post('/admin/process/:id/:restaurant_id')

  async processOrder(@Param('id') id:string,@Param('restaurant_id') restaurant_id:string){
    return new ActionResponse(await this.restaurantOrderService.orderProcessing(id));
  }

  @Post('/admin/ready-for-pickup/:id/:restaurant_id')

  async readyForPickup(@Param('id') id:string,@Param('restaurant_id') restaurant_id:string){
    return new ActionResponse(await this.restaurantOrderService.readyForPickup(id));
  }

  @Get('/admin/all')

  async getRestaurantOrdersAdmin(@Query() query:PaginatedRequest,){
    applyQueryIncludes(query,"payment_method");
    applyQueryIncludes(query,"driver");
    applyQueryIncludes(query,"restaurant");
    applyQuerySort(query,`created_at=desc`,);
 
   const orders=await this.restaurantOrderService.findAll(query);
   const total=await this.restaurantOrderService.count(query);
   const response = this._i18nResponse.entity(orders);
   const result=plainToInstance(RestaurantOrderListResponse,response,{
    excludeExtraneousValues: true,
  })
  return new PaginatedResponse(result,{
    meta:{
      total,
      ...query
    }
  });
}

  @Get('/admin/all/:restaurant_id')

  async getRestaurantOrdersAdminRequests(@Query() query:PaginatedRequest,@Param('restaurant_id') restaurant_id?:string){
    applyQueryIncludes(query,"payment_method");
    applyQueryIncludes(query,"driver");
    applyQueryIncludes(query,"restaurant");
    if(restaurant_id) applyQueryFilters(query,`restaurant_id=${restaurant_id}`);
   const orders=await this.restaurantOrderService.findAll(query);
   const total=await this.restaurantOrderService.count(query);
   const response = this._i18nResponse.entity(orders);
   const result=plainToInstance(RestaurantOrderListResponse,response,{
    excludeExtraneousValues: true,
  })
  return new PaginatedResponse(result,{
    meta:{
      total,
      ...query
    }
  });
}
@Post('/admin/assign-driver/:id/:driver_id')
async assignDriverToOrder(@Param('id') id:string,@Param('driver_id') driver_id:string){
  return new ActionResponse(await this.restaurantOrderService.assignDriverToOrder(id,driver_id));
}

}
