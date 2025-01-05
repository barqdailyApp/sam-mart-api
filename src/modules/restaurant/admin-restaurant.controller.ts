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
export class AdminRestaurantController {
  constructor(private readonly restaurantService: RestaurantService,
     @Inject(I18nResponse) private readonly _i18nResponse: I18nResponse,
  ) {}

  






}