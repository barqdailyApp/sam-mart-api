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
import { Slot } from 'src/infrastructure/entities/order/slot.entity';

@Injectable()
export class SlotSeeder implements Seeder {
  constructor(
    @InjectRepository(Slot)
    private readonly slot_repo: Repository<Slot>,
  ) {}

  async seed(): Promise<any> {
    const data = fs.readFileSync('./json/slot.json', 'utf8');
    const dataObject: Slot[] = JSON.parse(data);
    const slots = dataObject.map((slot) => {
      return this.slot_repo.create(slot);
    });
    return await this.slot_repo.save(slots);
  }

  async drop(): Promise<any> {
    return this.slot_repo.delete({});
  }
}
