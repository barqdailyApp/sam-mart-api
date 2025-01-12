import { Controller, UseGuards } from '@nestjs/common';
import { RestaurantCartService } from './restaurant-cart.service';
import { AddMealRestaurantCartRequest } from './dto/request/add-meal-restaurant-cart.request';
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
@ApiTags('Restaurant-Cart')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.CLIENT)
@Controller('restaurant-cart')
export class RestaurantCartController {
    constructor(private readonly resturantCartService: RestaurantCartService) {
          
    }
    async addMealToCart(req: AddMealRestaurantCartRequest) {
        return await this.resturantCartService.addMealToCart(req);
    }
}
