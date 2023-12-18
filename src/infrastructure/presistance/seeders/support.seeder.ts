import { Injectable } from '@nestjs/common';
import { Seeder, DataFactory } from 'nestjs-seeder';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';


import * as fs from 'fs';
import { PrivacyPolicy } from 'src/infrastructure/entities/privacy-policy/privacy-policy.entity';
import { Support } from 'src/infrastructure/entities/support/support.entity';

@Injectable()
export class SupportSeeder implements Seeder {
  constructor(
    @InjectRepository(Support)
    private readonly supportRepository: Repository<Support>,
  ) {}

  async seed(): Promise<any> {
    //* load data from json terms file
    const dataItems = fs.readFileSync('./json/support.json', 'utf8');
    const supportData = JSON.parse(dataItems);
    const supportEntity = this.supportRepository.create(supportData);
    //* save items entity in database
    return await this.supportRepository.save(supportEntity);
  }

  async drop(): Promise<any> {
    return this.supportRepository.delete({});
  }
}
