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
import { MeasurementUnit } from 'src/infrastructure/entities/product/measurement-unit.entity';
import { AdditionalService } from 'src/infrastructure/entities/product/additional-service.entity';

@Injectable()
export class AdditionalServiceSeeder implements Seeder {
  constructor(
    @InjectRepository(AdditionalService)
    private readonly additionalService_repo: Repository<AdditionalService>,
  ) {}

  async seed(): Promise<any> {
    const data = fs.readFileSync('./json/additional-services.json', 'utf8');
    const dataObject: AdditionalService[] = JSON.parse(data);
    const additionalServices = dataObject.map((unit) => {
      return this.additionalService_repo.create(unit);
    });
    return await this.additionalService_repo.save(additionalServices);
  }

  async drop(): Promise<any> {
    return this.additionalService_repo.delete({});
  }
}
