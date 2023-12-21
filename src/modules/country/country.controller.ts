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
} from '@nestjs/common';
import { CountryService } from './country.service';
import { ApiBearerAuth, ApiTags, ApiHeader } from '@nestjs/swagger';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { RolesGuard } from '../authentication/guards/roles.guard';
import { Country } from 'src/infrastructure/entities/country/country.entity';
import { CreateCountryRequest } from './dto/requests/create-country.request';
import { UpdateCountryRequest } from './dto/requests/update-country.request';
import { plainToClass } from 'class-transformer';
import { CountryResponse } from './dto/responses/country.response';
import { I18nResponse } from 'src/core/helpers/i18n.helper';
import { ActionResponse } from 'src/core/base/responses/action.response';
@ApiTags('Country')
@Controller('country')
export class CountryController {
  constructor(
    private readonly countryService: CountryService,
    @Inject(I18nResponse) private readonly _i18nResponse: I18nResponse,
  ) {}

  @Post('create-country')
  async create(@Body() createCountryRequest: CreateCountryRequest) {
    return new ActionResponse(
      await this.countryService.create(createCountryRequest),
    );
  }

  @Get(':country_id/single-country')
  async single(@Param('country_id') id: string) {
    const country = await this.countryService.single(id);
    const countryResponse = plainToClass(CountryResponse, country);
    return new ActionResponse(this._i18nResponse.entity(countryResponse));
  }
  @Get('all-countries')
  async allCountries() {
    const countries = await this.countryService.findAll();
    const countriesResponse = countries.map((country) =>
      plainToClass(CountryResponse, country),
    );
    return new ActionResponse(this._i18nResponse.entity(countriesResponse));
  }

  @Put(':country_id/update-country')
  async update(
    @Param('country_id') id: string,
    @Body() updateCountryRequest: UpdateCountryRequest,
  ) {
    return new ActionResponse(
      await this.countryService.update(id, updateCountryRequest),
    );
  }

  @Delete(':country_id/delete-country')
  async delete(@Param('country_id') id: string) {
    return new ActionResponse(await this.countryService.delete(id));
  }
}
