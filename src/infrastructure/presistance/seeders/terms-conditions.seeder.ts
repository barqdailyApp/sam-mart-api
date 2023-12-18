import { Injectable } from '@nestjs/common';
import { Seeder, DataFactory } from 'nestjs-seeder';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';


import * as fs from 'fs';
import { TermsConditions } from 'src/infrastructure/entities/terms-conditions/terms-conditions.entity';

@Injectable()
export class TermsConditionsSeeder implements Seeder {
  constructor(
    @InjectRepository(TermsConditions)
    private readonly termsConditionsRepository: Repository<TermsConditions>,
  ) {}

  async seed(): Promise<any> {
    //* load data from json terms file
    const dataItems = fs.readFileSync('./json/terms-conditions.json', 'utf8');
    const termsData = JSON.parse(dataItems);
    const items = termsData.map((termsConditions: TermsConditions, i: number) => {
      
      return this.termsConditionsRepository.create(termsConditions);
    });
    //* save items entities in database
    return await this.termsConditionsRepository.save(items);
  }

  async drop(): Promise<any> {
    return this.termsConditionsRepository.delete({});
  }
}
