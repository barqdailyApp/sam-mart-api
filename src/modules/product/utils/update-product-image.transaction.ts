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
import { UpdateProductImageRequest } from '../dto/request/update-product-image.request';

@Injectable()
export class UpdateProductImageTransaction extends BaseTransaction<
  UpdateProductImageRequest,
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
    query: UpdateProductImageRequest,
    context: EntityManager,
  ): Promise<Product> {
    try {
      const { product_id, product_image_id, is_logo, url } = query;

      //* check if product exist
      const product = await context.findOne(Product, {
        where: { id: product_id },
      });

      if (!product) {
        throw new NotFoundException('product not found');
      }

      //* check if product image exist
      const productImage = await context.findOne(ProductImage, {
        where: { id: product_image_id },
      });

      if (!productImage) {
        throw new NotFoundException('product image not found');
      }

      if (url) {
        ensureFilesExists(url);

        //* generator to move image to product-images folder
        const moveItemImage = moveTmpFiles([url], '/product-images/');
        const newItemImagePath = moveItemImage.next().value as string[];
        //* update product image
        await context.update(ProductImage, product_image_id, {
          url: newItemImagePath[0],
          is_logo,
        });
      }

      //* update product image
      await context.update(ProductImage, product_image_id, {
        is_logo,
      });
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
