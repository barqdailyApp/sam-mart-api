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
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { GetNearResturantsQuery } from './dto/requests/get-near-resturants.query';
import { RestaurantService } from './restaurant.service';
import { I18nResponse } from 'src/core/helpers/i18n.helper';
import { ActionResponse } from 'src/core/base/responses/action.response';
import { plainToInstance } from 'class-transformer';
import { MealResponse } from './dto/responses/meal.response';
import { RestaurantResponse } from './dto/responses/restaurant.response';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { Roles } from '../authentication/guards/roles.decorator';
import { RolesGuard } from '../authentication/guards/roles.guard';
import { PaginatedRequest } from 'src/core/base/requests/paginated.request';
import { applyQueryFilters } from 'src/core/helpers/service-related.helper';
import { RestaurantStatus } from 'src/infrastructure/data/enums/restaurant-status.enum';
import { PaginatedResponse } from 'src/core/base/responses/paginated.response';
import e from 'express';
import { RestaurantAdmin } from 'src/infrastructure/entities/restaurant/restaurant-admin.entity';
import { AdminRestaurantDeatailsResponse } from './dto/responses/admin-restaurant-deatails.response';
import { AddRestaurantCategoryRequest } from './dto/requests/add-restaurant-category.request';

@ApiBearerAuth()
@ApiHeader({
  name: 'Accept-Language',
  required: false,
  description: 'Language header: en, ar',
})
@ApiTags('Restaurant')
@UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
@Controller('restaurant')
export class AdminRestaurantController {
  constructor(
    private readonly restaurantService: RestaurantService,
    @Inject(I18nResponse) private readonly _i18nResponse: I18nResponse,
  ) {}

  @Get('admin/requests')
  async getRestaurantRequests(@Query() query: PaginatedRequest) {
    applyQueryFilters(query, `status=${RestaurantStatus.PENDING}`);
    const restaurants = await this.restaurantService.findAll(query);

    const total = await this.restaurantService.count(query);
    return new PaginatedResponse(
      plainToInstance(RestaurantResponse, restaurants, {
        excludeExtraneousValues: true,
      }),
      { meta: { total, ...query } },
    );
  }

  @Get('/admin/details/:id')
  async getSingleRestaurant(@Param('id') id: string) {
    const restaurant = await this.restaurantService.getSingleRestaurant(id);

    const response = plainToInstance(
      AdminRestaurantDeatailsResponse,
      restaurant,
      { excludeExtraneousValues: true },
    );
    console.log(response);
    return new ActionResponse(response);
  }
  @Post('/admin/accept/:id')
  async acceptRestaurant(@Param('id') id: string) {
    const restaurant = await this.restaurantService.acceptRestaurant(id);
    return new ActionResponse(restaurant);
  }
  @Roles(Role.RESTAURANT_ADMIN,Role.ADMIN)
  @Post('/admin/category/:restaurant_id')
  async addCategory(@Body() req: AddRestaurantCategoryRequest,@Param('restaurant_id') restaurant_id:string) {
    const category = await this.restaurantService.addRestaurantCategory(req,restaurant_id);
    return new ActionResponse(category);
  }
  

  }
