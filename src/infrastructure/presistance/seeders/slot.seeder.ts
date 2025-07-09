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
import { all } from 'axios';
import { DayOfWeek } from 'src/infrastructure/data/enums/day_of_week.enum';

@Injectable()
export class SlotSeeder implements Seeder {
  constructor(
    @InjectRepository(Slot)
    private readonly slot_repo: Repository<Slot>,
  ) {}

  async seed(): Promise<any> {
    const daysOfWeek = Object.values(DayOfWeek); // ['SUNDAY', 'MONDAY', ...]

    const getTimeZone = (hour: number): string => {
      if (hour < 12) return 'MORNING';
      if (hour < 17) return 'AFTERNOON';
      return 'EVENING';
    };

    const generateWeeklySlots = () => {
      const allSlots = [];

      for (const day of daysOfWeek) {
        let order = 1;

        for (let hour = 9; hour < 22; hour++) {
          const start = `${hour.toString().padStart(2, '0')}:00`;
          const end = `${(hour + 1).toString().padStart(2, '0')}:00`;
          const time_zone = getTimeZone(hour);

          allSlots.push({
            day_of_week: day, 
            start_time: start,
            end_time: end,
            time_zone,
            order_by: order++,
          });
        }
      }
      return allSlots;
    };
    return await this.slot_repo.save(generateWeeklySlots());
  }

  async drop(): Promise<any> {
    return this.slot_repo.delete({});
  }
}
