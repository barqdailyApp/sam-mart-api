import { Injectable } from '@nestjs/common';
import { Seeder, DataFactory } from 'nestjs-seeder';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';


import * as fs from 'fs';
import { SocialMedia } from 'src/infrastructure/entities/social-media/social-media.entity';

@Injectable()
export class SocialMediaSeeder implements Seeder {
  constructor(
    @InjectRepository(SocialMedia)
    private readonly socialMediaRepository: Repository<SocialMedia>,
  ) {}

  async seed(): Promise<any> {
    //* load data from json terms file
    const dataItems = fs.readFileSync('./json/social-media.json', 'utf8');
    const termsData = JSON.parse(dataItems);
    const items = termsData.map((socialMedia: SocialMedia, i: number) => {
      
      return this.socialMediaRepository.create(socialMedia);
    });
    //* save items entities in database
    return await this.socialMediaRepository.save(items);
  }

  async drop(): Promise<any> {
    return this.socialMediaRepository.delete({});
  }
}
