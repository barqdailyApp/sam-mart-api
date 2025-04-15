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
import { Constant } from 'src/infrastructure/entities/constant/constant.entity';
import { ConstantType } from 'src/infrastructure/data/enums/constant-type.enum';
import { DriverTypeEnum } from 'src/infrastructure/data/enums/driver-type.eum';

@Injectable()
export class ConstantSeeder implements Seeder {
  constructor(
    @InjectRepository(Constant)
    private readonly constnant_repo: Repository<Constant>,
  ) {}

  async seed(): Promise<any> {
    await this.constnant_repo.save([
      new Constant({ variable: '3', type: ConstantType.ORDER_LIMIT , section:DriverTypeEnum.MART}),
      new Constant({ variable: '40', type: ConstantType.DELIVERY_TIME , section:DriverTypeEnum.MART}),
      new Constant({ variable: '10', type: ConstantType.FIXED_DELIVERY_FEE , section:DriverTypeEnum.MART}),
      new Constant({ variable: '5', type: ConstantType.FREE_DELIVERY_DISTANCE , section:DriverTypeEnum.FOOD}),
      new Constant({ variable: '1', type: ConstantType.DELIVERY_PRICE_PER_KM , section:DriverTypeEnum.FOOD}),
      new Constant({ variable: '1', type: ConstantType.DELIVERY_TIME_PER_KM , section:DriverTypeEnum.FOOD}),
      new Constant({ variable: '100', type: ConstantType.DRIVER_BALANCE_LIMIT  , section:DriverTypeEnum.FOOD}),
      new Constant({ variable: '100', type: ConstantType.MAX_STORAGE_DISTANCE  , section:DriverTypeEnum.FOOD}),
      new Constant({ variable: '10', type: ConstantType.RESTAURANT_CASHBACK , section:DriverTypeEnum.FOOD}),
      
    ]);
  }

  async drop(): Promise<any> {
    return this.constnant_repo.delete({});
  }
}
