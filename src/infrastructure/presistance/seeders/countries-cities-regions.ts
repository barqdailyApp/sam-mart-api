import { Injectable } from '@nestjs/common';
import { Seeder, DataFactory } from 'nestjs-seeder';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/infrastructure/entities/user/user.entity';
import { Address } from 'src/infrastructure/entities/user/address.entity';
import { Country } from 'src/infrastructure/entities/country/country.entity';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { City } from 'src/infrastructure/entities/city/city.entity';
import { Region } from 'src/infrastructure/entities/region/region.entity';

@Injectable()
export class CountryCityRegionSeeder implements Seeder {
  constructor(
    @InjectRepository(Country)
    private readonly country_repo: Repository<Country>,
    @InjectRepository(City)
    private readonly city_repo: Repository<City>,
    @InjectRepository(Region)
    private readonly region_repo: Repository<Region>,
  ) {}

  async seed(): Promise<any> {
    // Get users.
    const data = fs.readFileSync(
      './json/countries-cities-regions.json',
      'utf8',
    );
    const dataObject: Country[] = JSON.parse(data);

    for (const country of dataObject) {
      const countryCreated = this.country_repo.create({
        name_ar: country.name_ar,
        name_en: country.name_en,
      });
      const countrySaved = await this.country_repo.save(countryCreated);

      for (const city of country.cities) {
        const cityCreated = this.city_repo.create({
          name_ar: city.name_ar,
          name_en: city.name_en,
          country: countrySaved,
        });
        const citySaved = await this.city_repo.save(cityCreated);
        for (const region of city.regions) {
          const regionCreated = this.region_repo.create({
            name_ar: region.name_ar,
            name_en: region.name_en,
            city: citySaved,
          });

          await this.region_repo.save(regionCreated);
        }
      }
    }
  }

  async drop(): Promise<any> {
    this.city_repo.delete({});
    return this.country_repo.delete({});
  }
}
