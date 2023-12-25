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

@Injectable()
export class MeasurementUnitSeeder implements Seeder {
  constructor(
    @InjectRepository(MeasurementUnit)
    private readonly measurementUnit_repo: Repository<MeasurementUnit>,
  ) {}

  async seed(): Promise<any> {
    const data = fs.readFileSync('./json/measurement-units.json', 'utf8');
    const dataObject: MeasurementUnit[] = JSON.parse(data);
    const measurementUnits = dataObject.map((unit) => {
      return this.measurementUnit_repo.create(unit);
    });
    return await this.measurementUnit_repo.save(measurementUnits);
  }

  async drop(): Promise<any> {
    return this.measurementUnit_repo.delete({});
  }
}
