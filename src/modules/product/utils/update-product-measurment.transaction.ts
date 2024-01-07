import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BaseTransaction } from 'src/core/base/database/base.transaction';
import { DataSource, EntityManager } from 'typeorm';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';

import { plainToInstance } from 'class-transformer';
import { Product } from 'src/infrastructure/entities/product/product.entity';
import { CreateProductRequest } from '../dto/request/create-product.request';
import { StorageManager } from 'src/integration/storage/storage.manager';
import { ImageManager } from 'src/integration/sharp/image.manager';
import * as sharp from 'sharp';
import { ProductImage } from 'src/infrastructure/entities/product/product-image.entity';
import { ProductMeasurement } from 'src/infrastructure/entities/product/product-measurement.entity';
import { MeasurementUnitService } from 'src/modules/measurement-unit/measurement-unit.service';
import { CreateProductMeasurementRequest } from '../dto/request/create-product-measurement.request';
import { UpdateProductRequest } from '../dto/request/update-product.request';
import { ProductService } from '../product.service';
import { ensureFilesExists, moveTmpFiles } from 'src/core/helpers/file.helper';
import { UpdateProductMeasurementRequest } from '../dto/request/update-product-measurement.request';
import { MeasurementUnit } from 'src/infrastructure/entities/product/measurement-unit.entity';

@Injectable()
export class UpdateProductMeasurementTransaction extends BaseTransaction<
  UpdateProductMeasurementRequest,
  Product
> {
  constructor(
    dataSource: DataSource,
    @Inject(REQUEST) readonly request: Request,
    @Inject(ImageManager) private readonly imageManager: ImageManager,

    @Inject(StorageManager) private readonly storageManager: StorageManager,
  ) {
    super(dataSource);
  }

  // the important thing here is to use the manager that we've created in the base class
  protected async execute(
    query: UpdateProductMeasurementRequest,
    context: EntityManager,
  ): Promise<Product> {
    try {
      const {
        conversion_factor,
        product_id,
        is_main_unit,
        product_measurement_unit_id,
        measurement_unit_id,
      } = query;

      const updateData: any = { conversion_factor, is_main_unit };

      //* check if product exist
      const product = await context.findOne(Product, {
        where: { id: product_id },
      });

      if (!product) {
        throw new NotFoundException('message.product_not_found');
      }

      //* check if product measurement unit exist
      const productMeasurement = await context.findOne(ProductMeasurement, {
        where: { id: product_measurement_unit_id },
      });
      if (!productMeasurement) {
        throw new NotFoundException('message.measurement_Unit_not_found');
      }

      //* check if  measurement unit exist
      if (measurement_unit_id) {
        const measurementUnit = await context.findOne(MeasurementUnit, {
          where: { id: productMeasurement.measurement_unit_id },
        });
        if (!measurementUnit) {
          throw new NotFoundException('message.measurement_Unit_not_found');
        }
        updateData.measurement_unit_id = measurement_unit_id;
      }

      //* Update base unit
      if (is_main_unit != undefined || is_main_unit != null) {
        if (is_main_unit) {
          updateData.base_unit_id = product_measurement_unit_id;
        } else {
          updateData.base_unit_id = null;
        }
      }

      await context.update(
        ProductMeasurement,
        { id: product_measurement_unit_id },
        updateData,
      );

      return await context.findOne(Product, {
        where: { id: product_id },
        relations: {
          product_images: true,
          product_measurements: {
            measurement_unit: true,
          },
        },
      });
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
