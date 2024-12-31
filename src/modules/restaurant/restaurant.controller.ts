import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { GetNearResturantsQuery } from './dto/requests/get-near-resturants.query';
import { RestaurantService } from './restaurant.service';
import { I18nResponse } from 'src/core/helpers/i18n.helper';
import { ActionResponse } from 'src/core/base/responses/action.response';
import { plainToInstance } from 'class-transformer';
import { MealResponse } from './dto/responses/meal.response';
import { RestaurantResponse } from './dto/responses/restaurant.response';

@ApiBearerAuth()
@ApiHeader({
  name: 'Accept-Language',
  required: false,
  description: 'Language header: en, ar',
})
@ApiTags('Restaurant')
@Controller('restaurant')
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService,
     @Inject(I18nResponse) private readonly _i18nResponse: I18nResponse,
  ) {}

@Get('/nearby')    
async getNearResturants(@Query() query: GetNearResturantsQuery) {
  const restaurants = await this.restaurantService.findAllNearRestaurants(query);
  const response = this._i18nResponse.entity(restaurants);

  return new ActionResponse(response);
}


@Get('/top-seller-meals')
async getTopSellerMeals(@Query() query: GetNearResturantsQuery){
  const meals = await this.restaurantService.getTopSellerMeals(query);
  const response =  this._i18nResponse.entity(plainToInstance( MealResponse,meals, { excludeExtraneousValues: true }));

  return new ActionResponse(response);

}

@Get('/details/:id')
async getSingleRestaurant(@Param("id") id:string){
  const restaurant=await this.restaurantService.getSingleRestaurant(id);
 const response= this._i18nResponse.entity((plainToInstance(RestaurantResponse,restaurant,{excludeExtraneousValues:true}))) 
 return new ActionResponse(response);
}

@Get('/meal/details/:id')
async getSingleMeal(@Param("id") id:string){
  const meal=await this.restaurantService.getSingleMeal(id);
 const response= this._i18nResponse.entity((plainToInstance(MealResponse,meal ,{excludeExtraneousValues:true}))) 
 return new ActionResponse(response);
}
}