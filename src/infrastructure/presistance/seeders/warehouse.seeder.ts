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
import { Warehouse } from 'src/infrastructure/entities/warehouse/warehouse.entity';

@Injectable()
export class WareHouseSeeder implements Seeder {
  constructor(
    @InjectRepository(Warehouse)
    private readonly warehouse_repo: Repository<Warehouse>,
    @InjectRepository(Region)
    private readonly region_repo: Repository<Region>,
  ) {}

  async seed(): Promise<any> {
    const data = fs.readFileSync('./json/warehouse.json', 'utf8');
    const dataObject: Warehouse[] = JSON.parse(data);
    const regions = await this.region_repo.find();

    const Warehouses = dataObject.map((unit) => {
        unit.region_id = regions[0].id
      return this.warehouse_repo.create(unit);
    });
    return await this.warehouse_repo.save(Warehouses);
  }

  async drop(): Promise<any> {
    return this.warehouse_repo.delete({});
  }
}
