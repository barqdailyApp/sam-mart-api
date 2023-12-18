import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { readFileSync } from 'fs';
import { date, options } from 'joi';
import { Seeder } from 'nestjs-seeder';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import { CancelReasons } from 'src/infrastructure/entities/order-cancel/cancel-reasons.entity';
@Injectable()
export class CancelReasonsSeeder implements Seeder {
  constructor(
    @InjectRepository(CancelReasons)
    private readonly repo: Repository<CancelReasons>,
  ) {}

  async seed(): Promise<any> {
    const data = fs.readFileSync('./json/cancel-reasons.json', 'utf-8');
    const reasonsData = JSON.parse(data);

    const result = reasonsData.map(
      (cancelReasons: CancelReasons, i: number) => {
        return this.repo.create(cancelReasons);
      },
    );
    //* save items entities in database
    return this.repo.save(result);
  }

  async drop(): Promise<any> {
    return this.repo.delete({});
  }
}
