import { Injectable } from '@nestjs/common';
import { Seeder, DataFactory } from 'nestjs-seeder';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/infrastructure/entities/user/user.entity';
import { Address } from 'src/infrastructure/entities/user/address.entity';
import { Country } from 'src/infrastructure/entities/country/country.entity';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { City } from 'src/infrastructure/entities/city/city.entity';
import { Region } from 'src/infrastructure/entities/region/region.entity';
import { MeasurementUnit } from 'src/infrastructure/entities/product/measurement-unit.entity';
import { Product } from 'src/infrastructure/entities/product/product.entity';
import { ProductImage } from 'src/infrastructure/entities/product/product-image.entity';
import { ProductMeasurement } from 'src/infrastructure/entities/product/product-measurement.entity';

@Injectable()
export class ProductSeeder implements Seeder {
  constructor(
    @InjectRepository(Product)
    private readonly product_repo: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImage_repo: Repository<ProductImage>,
    @InjectRepository(ProductMeasurement)
    private readonly productMeasurement_repo: Repository<ProductMeasurement>,
    @InjectRepository(MeasurementUnit)
    private readonly measurementUnit_repo: Repository<MeasurementUnit>,
  ) {}

  async seed(): Promise<any> {
    const data = fs.readFileSync('./json/product.json', 'utf8');
    const dataObject: Product[] = JSON.parse(data);
    for (const product of dataObject) {
      const createProduct = this.product_repo.create({
        name_ar: product.name_ar,
        name_en: product.name_en,
        description: product.description,
        is_active: product.is_active,
        is_recovered: product.is_recovered,
      });
      const productSaved = await this.product_repo.save(createProduct);
      for (const image of product.product_images) {
        const createProductImage = this.productImage_repo.create({
          url: image.url,
          is_logo: image.is_logo,
          product_id: productSaved.id,
        });
        await this.productImage_repo.save(createProductImage);
      }
      for (const measurement of product.product_measurements) {
        const measurement_unit = await this.measurementUnit_repo.findOne({
          where: { name_en: measurement.measurement_unit.name_en },
        });
        const createProductMeasurement = this.productMeasurement_repo.create({
          conversion_factor: measurement.conversion_factor,
          product_id: productSaved.id,
          measurement_unit_id: measurement_unit.id,
          is_main_unit: measurement.is_main_unit,
        });

        if (measurement.is_main_unit == true) {
          createProductMeasurement.base_unit_id = measurement_unit.id;
        }

         await this.productMeasurement_repo.save(
          createProductMeasurement,
        );
      }
    }
  }

  async drop(): Promise<any> {
    return this.product_repo.delete({});
  }
}
