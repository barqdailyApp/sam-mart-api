import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { RestaurantOrderService } from './restaurant-order.service';
import { MakeRestaurantOrderRequest } from './dto/request/make-restaurant-order.request';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { Roles } from '../authentication/guards/roles.decorator';
import { RolesGuard } from '../authentication/guards/roles.guard';
@ApiBearerAuth()
@ApiHeader({
  name: 'Accept-Language',
  required: false,
  description: 'Language header: en, ar',
})
@ApiTags('Restaurant-Order')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.CLIENT)
@Controller('restaurant-order')
export class RestaurantOrderController {
    constructor(private readonly restaurantOrderService: RestaurantOrderService){}

    @Post('checkout')
    async makeRestaurantOrder(@Body() req: MakeRestaurantOrderRequest){
        return await this.restaurantOrderService.makeRestaurantOrder(req);   
    }
}
