import { Injectable } from '@nestjs/common';
import { Seeder, DataFactory } from 'nestjs-seeder';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as fs from 'fs';
import { AboutUs } from 'src/infrastructure/entities/about-us/about-us.entity';
import { Color } from 'src/infrastructure/entities/color/color.entity';

@Injectable()
export class ColorSeeder implements Seeder {
  constructor(
    @InjectRepository(Color)
    private readonly colorRepository: Repository<Color>,
  ) {}

  async seed(): Promise<any> {
    //* load data from json Color file
    const dataColor = fs.readFileSync('./json/colors.json', 'utf8');
    const colorData = JSON.parse(dataColor);
    const colorEntity = this.colorRepository.create(colorData);

    //* save AboutUs entities in database
    return await this.colorRepository.save(colorEntity);
  }

  async drop(): Promise<any> {
    return this.colorRepository.delete({});
  }
}
