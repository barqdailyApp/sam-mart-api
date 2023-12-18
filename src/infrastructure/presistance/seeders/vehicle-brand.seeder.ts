import { Injectable } from '@nestjs/common';
import { Seeder } from 'nestjs-seeder';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import { VehicleBrand } from 'src/infrastructure/entities/vehicle/vehicle-brand.entity';
import { VehicleBrandModel } from 'src/infrastructure/entities/vehicle/vehicle-brand-model.entity';

@Injectable()
export class VehicleBrandSeeder implements Seeder {
  constructor(
    @InjectRepository(VehicleBrand)
    private readonly brandRepo: Repository<VehicleBrand>,
    @InjectRepository(VehicleBrandModel)
    private readonly modelRepo: Repository<VehicleBrandModel>,
  ) { }
  async seed(): Promise<any> {
    // load data from json file
    const data = fs.readFileSync('./json/vehicle-brands.json', 'utf8');
    const brandsData = JSON.parse(data);

    const brands = brandsData.map((brand: any, i: number) => {
      // create id slug from brand name_en
      brand.id = brand.name_en.toLowerCase().replace(/ /g, '-');
      return new VehicleBrand({ display_order: i + 1, ...brand });
    });
    const nBrands = await this.brandRepo.save(brands);

    nBrands.forEach(async (brand: VehicleBrand) => {
      brand.models = brand.models.map((model: any, i: number) => {
        // create id slug from model name_en
        const id = brand.id + '-' + model.toLowerCase().replace(/ /g, '-');
        return new VehicleBrandModel({
          id,
          vehicle_brand_id: brand.id,
          display_order: i + 1,
          name_en: model,
          name_ar: model,
        });
      });
    });

    return await this.modelRepo.save(
      nBrands.map((brand: VehicleBrand) => brand.models).flat(),
    );
  }

  async drop(): Promise<any> {
    return await Promise.all([this.brandRepo.delete({})]);
  }
}
