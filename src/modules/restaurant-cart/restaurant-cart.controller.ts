import { Body, Controller, Get, Inject, Post, UseGuards } from '@nestjs/common';
import { RestaurantCartService } from './restaurant-cart.service';
import { AddMealRestaurantCartRequest } from './dto/request/add-meal-restaurant-cart.request';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { Roles } from '../authentication/guards/roles.decorator';
import { RolesGuard } from '../authentication/guards/roles.guard';
import { I18n } from 'nestjs-i18n';
import { I18nResponse } from 'src/core/helpers/i18n.helper';
import { ActionResponse } from 'src/core/base/responses/action.response';
import { UpdateCartItemOptionRequest, UpdateCartItemQuantityRequest } from './dto/request/update-cart-item.request';

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
    constructor(private readonly resturantCartService: RestaurantCartService
      ,    @Inject(I18nResponse) private readonly _i18nResponse: I18nResponse,
    ) {
          
    }
    @Post('add-meal')
    async addMealToCart(@Body() req: AddMealRestaurantCartRequest) {
        return await this.resturantCartService.addMealToCart(req);
    }
    @Get('')
    async getCartMeals() {
       const meals = await this.resturantCartService.getCartMeals();
       const response = this._i18nResponse.entity(
         meals
       )
       return new ActionResponse(response);
    }
    
    @Post('update-quantity')
    async updateCartMealQuantity(@Body() req: UpdateCartItemQuantityRequest) {
      return await this.resturantCartService.updateCartMealQuantity(req);
    }

    @Post('update-option')
    async updateCartMealOption(@Body() req: UpdateCartItemOptionRequest) {
      return await this.resturantCartService.updateCartMealOption(req);
    }
}
