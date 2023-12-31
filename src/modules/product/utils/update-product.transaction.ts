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

@Injectable()
export class UpdateProductTransaction extends BaseTransaction<
  UpdateProductRequest,
  Product
> {
  constructor(
    dataSource: DataSource,
    @Inject(REQUEST) readonly request: Request,
    @Inject(ImageManager) private readonly imageManager: ImageManager,

    @Inject(StorageManager) private readonly storageManager: StorageManager,
    @Inject(MeasurementUnitService)
    private readonly measurementUnitService: MeasurementUnitService,
  ) {
    super(dataSource);
  }

  // the important thing here is to use the manager that we've created in the base class
  protected async execute(
    query: UpdateProductRequest,
    context: EntityManager,
  ): Promise<Product> {
    try {
      const {
        id,
        description,
        is_active,
        is_recovered,
        name_ar,
        name_en,
      } = query;
      const product = await context.findOne(Product, { where: { id } });

      if (!product) {
        throw new NotFoundException("message.product_not_found");
      }
      //* convert Dto To Product (Entity)
      const updateProduct: Product = plainToInstance(Product, {
        description,
        is_active,
        is_recovered,
        name_ar,
        name_en,
      });

      await context.update(Product, id, updateProduct);

      return await context.findOne(Product, {
        where: { id },
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
