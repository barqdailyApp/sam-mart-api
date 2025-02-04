import { Body, Controller, Get, Inject, Post, Query, UseGuards } from '@nestjs/common';
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
@ApiBearerAuth()
@ApiHeader({
  name: 'Accept-Language',
  required: false,
  description: 'Language header: en, ar',
})
@ApiTags('Restaurant-Order')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('restaurant-order')
export class RestaurantOrderController {
    constructor(private readonly restaurantOrderService: RestaurantOrderService
      ,@Inject(I18nResponse) private readonly _i18nResponse: I18nResponse
    ){}
  
    @Roles(Role.CLIENT)
    @Post('checkout')
    async makeRestaurantOrder(@Body() req: MakeRestaurantOrderRequest){
        return await this.restaurantOrderService.makeRestaurantOrder(req);   
    }

    @Roles(Role.DRIVER)
    @Get('driver-requests')
    async getRestaurantOrdersDriverRequests(@Query() query:PaginatedRequest){
      // add pagination
      const {orders,total}=await this.restaurantOrderService.getRestaurantOrdersDriverRequests(query);


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
}
