import { Injectable } from '@nestjs/common';
import { Seeder, DataFactory } from 'nestjs-seeder';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as fs from 'fs';
import { AboutUs } from 'src/infrastructure/entities/about-us/about-us.entity';
import { AppConstants } from 'src/infrastructure/entities/app-constants/app-constants.entity';

@Injectable()
export class AppConstantsSeeder implements Seeder {
  constructor(
    @InjectRepository(AppConstants)
    private readonly appConstantsRepository: Repository<AppConstants>,
  ) {}

  async seed(): Promise<any> {
    //* load data from json AboutUs file
    const dataAppConstants = fs.readFileSync('./json/app-constants.json', 'utf8');
    const appConstantsData = JSON.parse(dataAppConstants);
    const appConstantsEntity = this.appConstantsRepository.create(appConstantsData);

    //* save AppConstants entities in database
    return await this.appConstantsRepository.save(appConstantsEntity);
  }

  async drop(): Promise<any> {
    return this.appConstantsRepository.delete({});
  }
}
