import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { City } from 'src/infrastructure/entities/city/city.entity';
import { Country } from 'src/infrastructure/entities/country/country.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { CreateCityRequest } from './dto/requests/create-city.request';
import { UpdateCityRequest } from './dto/requests/update-city.request';
import { CountryService } from '../country/country.service';

@Injectable()
export class CityService {
  constructor(
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
    @Inject(CountryService)
    private readonly countryService: CountryService,
  ) {}
  async create(
    country_id: string,
    createCityRequest: CreateCityRequest,
  ): Promise<City> {
    await this.countryService.single(country_id);
    const newCity = this.cityRepository.create(createCityRequest);
    newCity.country_id = country_id;
    return await this.cityRepository.save(newCity);
  }
  async single(city_id: string): Promise<City> {
    const city = await this.cityRepository.findOne({
      where: { id: city_id },
      relations: { country: true },
    });
    if (!city) {
    throw new NotFoundException('message.city_not_found');
    }
    return city;
  }
  async allCitiesCountry(country_id: string): Promise<City[]> {
    return await this.cityRepository.find({
      relations: { country: true },
      where: { country_id: country_id },
    });
  }

  async update(
    city_id: string,
    updateCityRequest: UpdateCityRequest,
  ): Promise<UpdateResult> {
    await this.single(city_id);
   return await this.cityRepository.update({ id: city_id }, updateCityRequest);
  }
  async delete(city_id: string): Promise<DeleteResult> {
    await this.single(city_id);
    return  await this.cityRepository.softDelete({ id: city_id });
  }
}
