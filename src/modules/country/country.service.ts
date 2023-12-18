import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Country } from 'src/infrastructure/entities/country/country.entity';
import { Repository } from 'typeorm/repository/Repository';
import { CreateCountryRequest } from './dto/requests/create-country.request';
import { UpdateCountryRequest } from './dto/requests/update-country.request';

@Injectable()
export class CountryService {
  constructor(
    @InjectRepository(Country)
    private countryRepository: Repository<Country>,
  ) {}

  async create(createCountryRequest: CreateCountryRequest): Promise<Country> {
    const newCountry = this.countryRepository.create(createCountryRequest);
    return await this.countryRepository.save(newCountry);
  }
  async single(id: string): Promise<Country> {
    const country = await this.countryRepository.findOne({ where: { id } });
    if (!country) {
      throw new NotFoundException('country_not_found');
    }
    return country;
  }
  async findAll(): Promise<Country[]> {
    return await this.countryRepository.find();
  }

  async update(id: string, updateCountryRequest: UpdateCountryRequest): Promise<void> {
    await this.single(id);
    await this.countryRepository.update({ id }, updateCountryRequest);
  }
  async delete(id: string): Promise<void> {
    await this.single(id);
    await this.countryRepository.delete({ id });
  }
}
