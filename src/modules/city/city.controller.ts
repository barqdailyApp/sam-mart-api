import { CityService } from './city.service';
import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Param,
  Put,
  Delete,
  Inject,
  ClassSerializerInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiHeader } from '@nestjs/swagger';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { RolesGuard } from '../authentication/guards/roles.guard';
import { Country } from 'src/infrastructure/entities/country/country.entity';
import { plainToClass } from 'class-transformer';
import { I18nResponse } from 'src/core/helpers/i18n.helper';
import { CreateCityRequest } from './dto/requests/create-city.request';
import { CityResponse } from './dto/responses/cityresponse';
import { City } from 'src/infrastructure/entities/city/city.entity';
import { UpdateCityRequest } from './dto/requests/update-city.request';
import { ActionResponse } from 'src/core/base/responses/action.response';
@ApiBearerAuth()
@ApiHeader({
  name: 'Accept-Language',
  required: false,
  description: 'Language header: en, ar',
})
@ApiTags('City')
@Controller('city')
export class CityController {
  constructor(
    private readonly cityService: CityService,
    @Inject(I18nResponse) private readonly _i18nResponse: I18nResponse,
  ) {}
  @Post(':country_id/create-city/')
  async create(
    @Param('country_id') country_id: string,
    @Body() createCityRequest: CreateCityRequest,
  ): Promise<City> {
    return await this.cityService.create(country_id, createCityRequest);
  }
  @Get(':country_id/all-cities')
  async allCities(@Param('country_id') country_id: string) {
    const cities = await this.cityService.allCitiesCountry(country_id);
    const citiesResponse = cities.map((city) =>
      plainToClass(CityResponse, city),
    );
    return new ActionResponse(this._i18nResponse.entity(citiesResponse));
  }
  @Get(':city_id/single-city')
  async single(@Param('city_id') id: string) {
    const city = await this.cityService.single(id);
    const cityResponse = plainToClass(CityResponse, city);
    return new ActionResponse(this._i18nResponse.entity(cityResponse));
  }


  @Get(':country_id/all-cities-dashboard')
  async allCitiesDashboard(@Param('country_id') country_id: string) {
    const cities = await this.cityService.allCitiesCountry(country_id);
    const citiesResponse = cities.map((city) =>
      plainToClass(CityResponse, city),
    );
    return new ActionResponse(citiesResponse);
  }
  @Get(':city_id/single-city-dashboard')
  async singleDashboard(@Param('city_id') id: string) {
    const city = await this.cityService.single(id);
    const cityResponse = plainToClass(CityResponse, city);
    return new ActionResponse(cityResponse);
  }






  @Put(':city_id/update-city')
  async update(
    @Param('city_id') id: string,
    @Body() updateCityRequest: UpdateCityRequest,
  ) {
    return new ActionResponse(
      await this.cityService.update(id, updateCityRequest),
    );
  }

  @Delete(':city_id/delete-city')
  async delete(@Param('city_id') id: string) {
    return new ActionResponse(await this.cityService.delete(id));
  }
}
