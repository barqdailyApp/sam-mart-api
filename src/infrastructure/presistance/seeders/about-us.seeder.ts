import { Injectable } from '@nestjs/common';
import { Seeder, DataFactory } from 'nestjs-seeder';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as fs from 'fs';
import { AboutUs } from 'src/infrastructure/entities/about-us/about-us.entity';

@Injectable()
export class AboutUsSeeder implements Seeder {
  constructor(
    @InjectRepository(AboutUs)
    private readonly aboutUsRepository: Repository<AboutUs>,
  ) {}

  async seed(): Promise<any> {
    //* load data from json AboutUs file
    const dataAboutUs = fs.readFileSync('./json/about-us.json', 'utf8');
    const aboutUsData = JSON.parse(dataAboutUs);
    const aboutUsEntity = this.aboutUsRepository.create(aboutUsData);

    //* save AboutUs entities in database
    return await this.aboutUsRepository.save(aboutUsEntity);
  }

  async drop(): Promise<any> {
    return this.aboutUsRepository.delete({});
  }
}
