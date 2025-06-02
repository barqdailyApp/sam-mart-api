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
import { ApiBearerAuth, ApiHeader, ApiQuery, ApiTags } from '@nestjs/swagger';
import { GetNearResturantsQuery } from './dto/requests/get-near-resturants.query';
import { RestaurantService } from './restaurant.service';
import { I18nResponse } from 'src/core/helpers/i18n.helper';
import { ActionResponse } from 'src/core/base/responses/action.response';
import { plainToInstance } from 'class-transformer';
import { MealOfferResponse, MealResponse } from './dto/responses/meal.response';
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
import {
  AddRestaurantCategoryRequest,
  UpdateRestaurantCategoryRequest,
} from './dto/requests/add-restaurant-category.request';
import {
  AddMealRequest,
  UpdateMealRequest,
} from './dto/requests/add-meal.request';
import { AddCuisineRequest } from './dto/requests/add-cuisine.request';
import {
  AddOptionGroupRequest,
  CreateOptionRequest,
  UpdateOptionGroupRequest,
  UpdateOptionRequest,
} from './dto/requests/add-option-group.request';
import {
  AddMealOptionGroupsRequest,
  UpdateMealOptionPriceRequest,
} from './dto/requests/add-meal-option-groups.request';
import { Create } from 'sharp';
import { UpdateRestaurantRequest } from './dto/requests/update-restaurant.request';
import { UpdateCuisineRequest } from './dto/requests/update-cusisine.request';
import {
  MakeMealOfferRequest,
  UpdateMealOfferRequest,
} from './dto/requests/make-meal-offer.request';
import { CuisineResponse } from './dto/responses/cuisine.response';
import { addRestaurantSchedule } from './dto/requests/add-restaurant-schedule.request';
import { updateRestaurantScheduleRequest } from './dto/requests/update-restaurant.schedule.request';
import { OptionGroupResponse } from './dto/responses/option-group.response';

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
  async addCuisine(@Body() req: AddCuisineRequest) {
    const cuisine = await this.restaurantService.addCuisine(req);
    return new ActionResponse(cuisine);
  }

  @Put('admin/update-cuisine')
  async editCuisine(@Body() req: UpdateCuisineRequest) {
    const cuisine = await this.restaurantService.updateCuisine(req);
    return new ActionResponse(cuisine);
  }
  @Delete('admin/delete-cuisine/:id')
  async deleteCuisine(@Param('id') id: string) {
    const cuisine = await this.restaurantService.deleteCuisine(id);
    return new ActionResponse(cuisine);
  }

  @Roles(Role.RESTAURANT_ADMIN, Role.ADMIN)
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
  @Roles(Role.RESTAURANT_ADMIN, Role.ADMIN)
  @Get('/admin/details/:id')
  async getSingleRestaurant(@Param('id') id: string) {
    const restaurant = await this.restaurantService.getAdminSingleRestaurant(
      id,
    );

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

  @Roles(Role.RESTAURANT_ADMIN, Role.ADMIN)
  @Put('/admin/update/:restaurant_id')
  async update(
    @Param('restaurant_id') restaurant_id: string,
    @Body() req: UpdateRestaurantRequest,
  ) {
    const restaurant = await this.restaurantService.updateRestaurant(
      req,
      restaurant_id,
    );
    return new ActionResponse(restaurant);
  }
  @Roles(Role.RESTAURANT_ADMIN, Role.ADMIN)
  @Post('/admin/category/:restaurant_id')
  async addCategory(
    @Body() req: AddRestaurantCategoryRequest,
    @Param('restaurant_id') restaurant_id: string,
  ) {
    const category = await this.restaurantService.addRestaurantCategory(
      req,
      restaurant_id,
    );
    return new ActionResponse(category);
  }

  @Roles(Role.RESTAURANT_ADMIN, Role.ADMIN)
  @Get('/admin/categories/:restaurant_id')
  async getCategories(@Param('restaurant_id') restaurant_id: string) {
    const categories = await this.restaurantService.getRestaurantCategories(
      restaurant_id,
    );
    return new ActionResponse(categories);
  }
  @Roles(Role.RESTAURANT_ADMIN, Role.ADMIN)
  @Get('/admin/category-meals/:restaurant_id/:id')
  async getCategoriesMeals(
    @Param('restaurant_id') restaurant_id: string,
    @Param('id') id: string,
  ) {
    const categories = await this.restaurantService.getRestaurantCategoryMeals(
      restaurant_id,
      id,
    );

    const response = categories as any;
    response.meals = plainToInstance(MealResponse, response.meals, {
      excludeExtraneousValues: true,
    });
    return new ActionResponse(response);
  }

  @Roles(Role.RESTAURANT_ADMIN, Role.ADMIN)
  @Put('/admin/category/:restaurant_id')
  async editCategory(
    @Body() req: UpdateRestaurantCategoryRequest,
    @Param('restaurant_id') restaurant_id: string,
  ) {
    const category = await this.restaurantService.editRestaurantCategory(
      req,
      restaurant_id,
    );

    return new ActionResponse(category);
  }
  //DELTE
  @Roles(Role.RESTAURANT_ADMIN, Role.ADMIN)
  @Delete('/admin/category/:id/:restaurant_id')
  async deleteCategory(
    @Param('id') id: string,
    @Param('restaurant_id') restaurant_id: string,
  ) {
    const category = await this.restaurantService.deleteCategory(
      id,
      restaurant_id,
    );

    return new ActionResponse(category);
  }

  @Roles(Role.RESTAURANT_ADMIN, Role.ADMIN)
  @Post('/admin/meal/:restaurant_id')
  async addMeal(
    @Body() req: AddMealRequest,
    @Param('restaurant_id') restaurant_id: string,
  ) {
    const meal = await this.restaurantService.addMeal(req, restaurant_id);
    return new ActionResponse(meal);
  }

  @Roles(Role.RESTAURANT_ADMIN, Role.ADMIN)
  @Put('/admin/meal/:restaurant_id')
  async editMeal(
    @Body() req: UpdateMealRequest,
    @Param('restaurant_id') restaurant_id: string,
  ) {
    const meal = await this.restaurantService.editMeal(req, restaurant_id);
    return new ActionResponse(meal);
  }
  //DELETE
  @Roles(Role.RESTAURANT_ADMIN, Role.ADMIN)
  @Delete('/admin/meal/:restaurant_id/:id')
  async deleteMeal(
    @Param('id') id: string,
    @Param('restaurant_id') restaurant_id: string,
  ) {
    const meal = await this.restaurantService.deleteMeal(id, restaurant_id);
    return new ActionResponse(meal);
  }
  //get option groups
  @Roles(Role.RESTAURANT_ADMIN, Role.ADMIN)
  @Get('/admin/option-groups/:restaurant_id')
  async getOptionGroups(@Param('restaurant_id') restaurant_id: string) {
    const option_groups =
      await this.restaurantService.getRestaurantOptionGroups(restaurant_id);
    return new ActionResponse(option_groups);
  }
  // get single option group
  @Roles(Role.RESTAURANT_ADMIN, Role.ADMIN)
  @Get('/admin/option-group/:restaurant_id/:id')
  async getSingleOptionGroup(
    @Param('id') id: string,
    @Param('restaurant_id') restaurant_id: string,
  ) {
    const option_group = await this.restaurantService.getSingleOptionGroup(
      id,
      restaurant_id,
    );
    return new ActionResponse(option_group);
  }
  //create option group
  @Roles(Role.RESTAURANT_ADMIN, Role.ADMIN)
  @Post('/admin/option-group/:restaurant_id')
  async addOptionGroup(
    @Body() req: AddOptionGroupRequest,
    @Param('restaurant_id') restaurant_id: string,
  ) {
    const option_group = await this.restaurantService.addOptionGroup(
      req,
      restaurant_id,
    );
    return new ActionResponse(option_group);
  }

  @Roles(Role.RESTAURANT_ADMIN, Role.ADMIN)
  @Put('/admin/option-group/:restaurant_id')
  async editOptionGroup(
    @Body() req: UpdateOptionGroupRequest,
    @Param('restaurant_id') restaurant_id: string,
  ) {
    const option_group = await this.restaurantService.editOptionGroup(
      req,
      restaurant_id,
    );
    return new ActionResponse(option_group);
  }

  //DELETE
  @Roles(Role.RESTAURANT_ADMIN, Role.ADMIN)
  @Delete('/admin/option-group/:restaurant_id/:id')
  async deleteOptionGroup(
    @Param('id') id: string,
    @Param('restaurant_id') restaurant_id: string,
  ) {
    const option_group = await this.restaurantService.deleteOptionGroup(
      id,
      restaurant_id,
    );
    return new ActionResponse(option_group);
  }

  //edit option
  @Roles(Role.RESTAURANT_ADMIN, Role.ADMIN)
  @Put('/admin/option/:restaurant_id')
  async editOption(
    @Body() req: UpdateOptionRequest,
    @Param('restaurant_id') restaurant_id: string,
  ) {
    const option = await this.restaurantService.editOption(req, restaurant_id);
    return new ActionResponse(option);
  }

  //DELETE
  @Roles(Role.RESTAURANT_ADMIN, Role.ADMIN)
  @Delete('/admin/option/:restaurant_id/:id')
  async deleteOption(
    @Param('id') id: string,
    @Param('restaurant_id') restaurant_id: string,
  ) {
    const option = await this.restaurantService.deleteOption(id, restaurant_id);
    return new ActionResponse(option);
  }

  //add meal option groups
  @Roles(Role.RESTAURANT_ADMIN, Role.ADMIN)
  @Post('/admin/meal-option-groups/:restaurant_id')
  async addMealOptionGroups(
    @Body() req: AddMealOptionGroupsRequest,
    @Param('restaurant_id') restaurant_id: string,
  ) {
    const option = await this.restaurantService.addMealOptionGroups(
      req,
      restaurant_id,
    );
    return new ActionResponse(option);
  }

  @Roles(Role.RESTAURANT_ADMIN, Role.ADMIN)
  @Get('/admin/meal-option-groups/:meal_id/:restaurant_id')
  async getMealOptionGroups(
    @Param('meal_id') meal_id: string,
    @Param('restaurant_id') restaurant_id: string,
  ) {
    const options = await this.restaurantService.getMealOptionGroup(meal_id);
    const response = plainToInstance(OptionGroupResponse, options, {
      excludeExtraneousValues: true,
    });
    return new ActionResponse(response);
  }

  @Roles(Role.RESTAURANT_ADMIN, Role.ADMIN)
  @Post(
    '/admin/meal-option-groups/apply-offer/:meal_option_group_id/:restaurant_id',
  )
  async applyOfferMealOptionGroups(
    @Param('meal_option_group_id') meal_option_group_id: string,
    @Param('restaurant_id') restaurant_id: string,
  ) {
    const meal_option_group =
      await this.restaurantService.mealOptionGroupApplyOffer(
        meal_option_group_id,
      );

    return new ActionResponse(meal_option_group);
  }

  //update meal option groups
  @Roles(Role.RESTAURANT_ADMIN, Role.ADMIN)
  @Put('/admin/meal-option-groups/:restaurant_id')
  async updateMealOptionGroups(
    @Body() req: UpdateMealOptionPriceRequest,
    @Param('restaurant_id') restaurant_id: string,
  ) {
    const option_group = await this.restaurantService.editMealOptionPrices(
      req,
      restaurant_id,
    );
    return new ActionResponse(option_group);
  }
  // delete meal option group
  @Roles(Role.RESTAURANT_ADMIN, Role.ADMIN)
  @Delete('/admin/meal-option-groups/:restaurant_id/:id')
  async deleteMealOptionGroup(
    @Param('id') id: string,
    @Param('restaurant_id') restaurant_id: string,
  ) {
    const option_group = await this.restaurantService.deleteMealOptionGroup(
      id,
      restaurant_id,
    );
    return new ActionResponse(option_group);
  }
  // add optiom to option group
  @Roles(Role.RESTAURANT_ADMIN, Role.ADMIN)
  @Post('/admin/option/:restaurant_id')
  async addOption(
    @Body() req: CreateOptionRequest,
    @Param('restaurant_id') restaurant_id: string,
  ) {
    const option = await this.restaurantService.addOptionToOptionGroup(
      req,
      restaurant_id,
    );
    return new ActionResponse(option);
  }
  @Roles(Role.RESTAURANT_ADMIN, Role.ADMIN)
  @Post('admin/make-offer/:restaurant_id')
  async makeOffer(
    @Body() req: MakeMealOfferRequest,
    @Param('restaurant_id') restaurant_id: string,
  ) {
    const offer = await this.restaurantService.makeOffer(req, restaurant_id);
    return new ActionResponse(offer);
  }
  @Roles(Role.RESTAURANT_ADMIN, Role.ADMIN)
  @Get('/admin/meals-offers/:restaurant_id')
  async getMealsOffers(@Param('restaurant_id') restaurant_id: string) {
    const meals = await this.restaurantService.getAdminMealsOffers(
      restaurant_id,
    );

    const response = plainToInstance(MealOfferResponse, meals, {
      excludeExtraneousValues: true,
    });
    return new ActionResponse(response);
  }

  @Roles(Role.RESTAURANT_ADMIN, Role.ADMIN)
  @Put('/admin/meal-offer/:restaurant_id')
  async editMealOffer(
    @Body() req: UpdateMealOfferRequest,
    @Param('restaurant_id') restaurant_id: string,
  ) {
    const offer = await this.restaurantService.editMealOffer(
      req,
      restaurant_id,
    );
    return new ActionResponse(offer);
  }

  @Post('/admin/add-group')
  async addGroup(@Body() req: AddCuisineRequest) {
    const group = await this.restaurantService.addRestauntGroup(req);
    return new ActionResponse(group);
  }

  @Post('/admin/add-group-to-restaurant/:group_id/:restaurant_id')
  async addGrouptoRestaurant(
    @Param('group_id') group_id: string,
    @Param('restaurant_id') restaurant_id: string,
  ) {
    const group = await this.restaurantService.addGroupToRestaurant(
      group_id,
      restaurant_id,
    );
    return new ActionResponse(group);
  }
  @Delete('/admin/delete-group-from-restaurant/:group_id/:restaurant_id')
  async deleteGroupFromRestaurant(
    @Param('group_id') group_id: string,
    @Param('restaurant_id') restaurant_id: string,
  ) {
    const group = await this.restaurantService.unlinkGroupFromRestaurant(
      group_id,
      restaurant_id,
    );
    return new ActionResponse(group);
  }

  @Put('/admin/update-group')
  async updateGroup(@Body() req: UpdateCuisineRequest) {
    const group = await this.restaurantService.updateRestauntGroup(req);
    return new ActionResponse(group);
  }
  @Delete('/admin/delete-group/:id')
  async deleteGroup(@Param('id') id: string) {
    const group = await this.restaurantService.deleteRestauntGroup(id);
    return new ActionResponse(group);
  }
  @Get('/admin/get-groups')
  async getGroups() {
    const groups = await this.restaurantService.getAdminRestaurantGroups();
    const response = plainToInstance(CuisineResponse, groups, {
      excludeExtraneousValues: true,
    });
    return new ActionResponse(response);
  }
  @Roles(Role.RESTAURANT_ADMIN, Role.ADMIN)
  @Post('/admin/schedule/:restaurant_id')
  async addSchedule(
    @Body() req: addRestaurantSchedule,
    @Param('restaurant_id') restaurant_id: string,
  ) {
    const schedule = await this.restaurantService.addRestaurantSchedule(
      req,
      restaurant_id,
    );
    return new ActionResponse(schedule);
  }
  @Roles(Role.RESTAURANT_ADMIN, Role.ADMIN)
  @Put('/admin/schedule/:restaurant_id')
  async editSchedule(
    @Body() req: updateRestaurantScheduleRequest,
    @Param('restaurant_id') restaurant_id: string,
  ) {
    const schedule = await this.restaurantService.editRestaurantSchedule(
      req,
      restaurant_id,
    );
    return new ActionResponse(schedule);
  }
  @Roles(Role.RESTAURANT_ADMIN, Role.ADMIN)
  @Delete('/admin/schedule/:restaurant_id/:id')
  async deleteSchedule(
    @Param('id') id: string,
    @Param('restaurant_id') restaurant_id: string,
  ) {
    const schedule = await this.restaurantService.deleteRestaurantSchedule(
      id,
      restaurant_id,
    );
    return new ActionResponse(schedule);
  }

  @Roles(Role.ADMIN)
  @Put('/admin/change-status')
  @ApiQuery({
  name: 'status',
  enum: RestaurantStatus,
  required: true,
  description: 'New status for the restaurant',
})
  async changeStatus(
    @Param('id') id: string,
    @Param('restaurant_id') restaurant_id: string,
    @Query('status') status: RestaurantStatus,
  ) {
    const result = await this.restaurantService.changeStatus(id, status);
    return new ActionResponse(result);
  }
}
