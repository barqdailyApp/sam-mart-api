import { Injectable } from '@nestjs/common';
import { Seeder, DataFactory } from 'nestjs-seeder';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';


import * as fs from 'fs';
import { PrivacyPolicy } from 'src/infrastructure/entities/privacy-policy/privacy-policy.entity';

@Injectable()
export class PrivacyPolicySeeder implements Seeder {
  constructor(
    @InjectRepository(PrivacyPolicy)
    private readonly privacyPolicyRepository: Repository<PrivacyPolicy>,
  ) {}

  async seed(): Promise<any> {
    //* load data from json terms file
    const dataItems = fs.readFileSync('./json/privacy-policy.json', 'utf8');
    const termsData = JSON.parse(dataItems);
    const items = termsData.map((privacyPolicy: PrivacyPolicy, i: number) => {
      
      return this.privacyPolicyRepository.create(privacyPolicy);
    });
    //* save items entities in database
    return await this.privacyPolicyRepository.save(items);
  }

  async drop(): Promise<any> {
    return this.privacyPolicyRepository.delete({});
  }
}
