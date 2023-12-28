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
import { StorageManager } from 'src/integration/storage/storage.manager';
import { ImageManager } from 'src/integration/sharp/image.manager';
import * as sharp from 'sharp';
import { ProductImage } from 'src/infrastructure/entities/product/product-image.entity';
import { ProductMeasurement } from 'src/infrastructure/entities/product/product-measurement.entity';
import { MeasurementUnitService } from 'src/modules/measurement-unit/measurement-unit.service';
import { ensureFilesExists, moveTmpFiles } from 'src/core/helpers/file.helper';
import { CreateProductCategoryPriceRequest } from '../dto/request/create-product-category-price.request';
import { ProductService } from 'src/modules/product/product.service';
import { ProductCategoryPrice } from 'src/infrastructure/entities/product/product-category-price.entity';

@Injectable()
export class CreateProductCategoryPriceTransaction extends BaseTransaction<
  CreateProductCategoryPriceRequest,
  ProductCategoryPrice
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
    query: CreateProductCategoryPriceRequest,
    context: EntityManager,
  ): Promise<ProductCategoryPrice> {
    try {
      const {
        product_measurement_id,
        price,
        max_order_quantity,
        min_order_quantity,
      } = query;
      const product = await context.findOne(ProductMeasurement, {
        where: { id: product_measurement_id },
      });

      if (!product) {
        throw new NotFoundException('product measurement not found');
      }

      const createProductCategoryPrice = context.create(ProductCategoryPrice, {
        product_measurement_id,
        price,
        min_order_quantity,
        max_order_quantity,
      });
      const productCategoryPrice = await context.save(createProductCategoryPrice);
      return productCategoryPrice;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
