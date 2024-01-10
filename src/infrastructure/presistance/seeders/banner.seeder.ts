import { Injectable } from '@nestjs/common';
import { Seeder, DataFactory } from 'nestjs-seeder';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import { Banar } from 'src/infrastructure/entities/banar/banar.entity';

@Injectable()
export class BanarSeeder implements Seeder {
  constructor(
    @InjectRepository(Banar)
    private readonly banarRepo: Repository<Banar>,
  ) {}

  async seed(): Promise<any> {
    const data = fs.readFileSync('./json/banners.json', 'utf8');
    const bannersJson: Banar[] = JSON.parse(data);

    for (const banner of bannersJson) {
      const createBanner = this.banarRepo.create({
        banar: banner.banar,
        started_at: new Date(banner.started_at),
        ended_at: new Date(banner.ended_at),
        is_active: banner.is_active,
      });
      await this.banarRepo.save(createBanner);
    }
  }

  async drop(): Promise<any> {
    return await this.banarRepo.delete({});
  }
}