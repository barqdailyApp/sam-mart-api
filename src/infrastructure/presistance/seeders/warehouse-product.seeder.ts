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
import { Warehouse } from 'src/infrastructure/entities/warehouse/warehouse.entity';
import { WarehouseProducts } from 'src/infrastructure/entities/warehouse/warehouse-products.entity';
import { ProductMeasurement } from 'src/infrastructure/entities/product/product-measurement.entity';

@Injectable()
export class WareHouseProductsSeeder implements Seeder {
  constructor(
    @InjectRepository(WarehouseProducts)
    private readonly warehouseProducts_repo: Repository<WarehouseProducts>,
    @InjectRepository(ProductMeasurement)
    private readonly productMeasurement_repo: Repository<ProductMeasurement>,
    @InjectRepository(Warehouse)
    private readonly warehouse_repo: Repository<Warehouse>,
  ) {}

  async seed(): Promise<any> {
    const productMeasurements = await this.productMeasurement_repo.find({
      where: {
        is_main_unit: true,
      },
    });
    const warehouses = await this.warehouse_repo.find({});

    for (let i = 0; i < warehouses.length; i++) {
      for (let j = 0; j < productMeasurements.length; j++) {
        const warehouseProducts = this.warehouseProducts_repo.create({
          product_id: productMeasurements[j].product_id,
          product_measurement_id: productMeasurements[j].id,
          warehouse_id: warehouses[i].id,
          quantity: Math.floor(Math.random() * 9000) + 1000,
        });
        await this.warehouseProducts_repo.save(warehouseProducts);
      }
    }
  }

  async drop(): Promise<any> {
    return this.warehouseProducts_repo.delete({});
  }
}
