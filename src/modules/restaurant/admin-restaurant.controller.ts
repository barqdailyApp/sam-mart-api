import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
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
import { AddRestaurantCategoryRequest, UpdateRestaurantCategoryRequest } from './dto/requests/add-restaurant-category.request';
import { AddMealRequest, UpdateMealRequest } from './dto/requests/add-meal.request';
import { AddCuisineRequest } from './dto/requests/add-cuisine.request';
import { AddOptionGroupRequest } from './dto/requests/add-option-group.request';

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

  @Post('admin/cuisine')
  async addCuisine(@Body() req:AddCuisineRequest){
    const cuisine = await this.restaurantService.addCuisine(req);
    return new ActionResponse(cuisine);
  }

  @Get('admin/all')
  async getRestaurantRequests(@Query() query: PaginatedRequest) {
    
    const restaurants = await this.restaurantService.findAll(query);

    const total = await this.restaurantService.count(query);
    return new PaginatedResponse(
      plainToInstance(RestaurantResponse, restaurants, {
        excludeExtraneousValues: true,
      }),
      { meta: { total, ...query } },
    );
  }
@Roles(Role.RESTAURANT_ADMIN,Role.ADMIN)
  @Get('/admin/details/:id')
  async getSingleRestaurant(@Param('id') id: string) {
    const restaurant = await this.restaurantService.getAdminSingleRestaurant(id);
console.log(restaurant)
    const response = plainToInstance(
      AdminRestaurantDeatailsResponse,
      restaurant,
      { excludeExtraneousValues: true },
    );
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

  @Roles(Role.RESTAURANT_ADMIN,Role.ADMIN)
  @Get('/admin/categories/:restaurant_id')
  async getCategories(@Param('restaurant_id') restaurant_id:string) {
    const categories = await this.restaurantService.getRestaurantCategories(restaurant_id);
    return new ActionResponse(categories);
  }
  @Roles(Role.RESTAURANT_ADMIN,Role.ADMIN)
  @Get('/admin/category-meals/:restaurant_id/:id')
  async getCategoriesMeals(@Param('restaurant_id') restaurant_id:string, @Param('id') id:string) {
    const categories = await this.restaurantService.getRestaurantCategoryMeals(restaurant_id,id);
    const response= categories as any
    response.meals = plainToInstance(MealResponse, response.meals, {
      excludeExtraneousValues: true,
    })
    return new ActionResponse(response);
  }


  @Roles(Role.RESTAURANT_ADMIN,Role.ADMIN)
  @Put('/admin/category/:restaurant_id')
  async editCategory(@Body() req: UpdateRestaurantCategoryRequest,@Param('restaurant_id') restaurant_id:string) {
    const category = await this.restaurantService.editRestaurantCategory(req,restaurant_id);
    return new ActionResponse(category);
  }
  //DELTE 
  @Roles(Role.RESTAURANT_ADMIN,Role.ADMIN)
  @Delete('/admin/category/:id/:restaurant_id')
  async deleteCategory(@Param('id') id:string,@Param('restaurant_id') restaurant_id:string) {
    const category = await this.restaurantService.deleteCategory(id,restaurant_id);
    return new ActionResponse(category);
  }
  
  
  
  @Roles(Role.RESTAURANT_ADMIN,Role.ADMIN)
  @Post('/admin/meal/:restaurant_id')
  async addMeal(@Body() req: AddMealRequest,@Param('restaurant_id') restaurant_id:string) {
    const meal = await this.restaurantService.addMeal(req,restaurant_id);
    return new ActionResponse(meal);
  }

  @Roles(Role.RESTAURANT_ADMIN,Role.ADMIN)
  @Put('/admin/meal/:restaurant_id')
  async editMeal(@Body() req: UpdateMealRequest,@Param('restaurant_id') restaurant_id:string) {
    const meal = await this.restaurantService.editMeal(req,restaurant_id);
    return new ActionResponse(meal);
  }
  //DELETE 
  @Roles(Role.RESTAURANT_ADMIN,Role.ADMIN)
  @Delete('/admin/meal/:restaurant_id/:id')
  async deleteMeal(@Param('id') id:string,@Param('restaurant_id') restaurant_id:string) {
    const meal = await this.restaurantService.deleteMeal(id,restaurant_id);
    return new ActionResponse(meal);
  }
   
  //create option group
  @Roles(Role.RESTAURANT_ADMIN,Role.ADMIN)
  @Post('/admin/option-group/:restaurant_id')
  async addOptionGroup(@Body() req:AddOptionGroupRequest,@Param('restaurant_id') restaurant_id:string) {
    const option_group = await this.restaurantService.addOptionGroup(req,restaurant_id);
    return new ActionResponse(option_group);

  }}
