import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BaseTransaction } from 'src/core/base/database/base.transaction';
import { DataSource, DeleteResult, EntityManager } from 'typeorm';
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
import {
  ensureFilesExists,
  moveTmpFile,
  moveTmpFiles,
} from 'src/core/helpers/file.helper';
import { WarehouseProducts } from 'src/infrastructure/entities/warehouse/warehouse-products.entity';
import { ProductSubCategory } from 'src/infrastructure/entities/product/product-sub-category.entity';
import { ProductOffer } from 'src/infrastructure/entities/product/product-offer.entity';

@Injectable()
export class DeleteProductTransaction extends BaseTransaction<
  {
    product_id: string;
  },
  DeleteResult
> {
  constructor(
    dataSource: DataSource,
    @Inject(REQUEST) readonly request: Request,
  ) {
    super(dataSource);
  }

  // the important thing here is to use the manager that we've created in the base class
  protected async execute(
    req: {
      product_id: string;
    },
    context: EntityManager,
  ): Promise<DeleteResult> {
    try {
      const { product_id } = req;
      const product = await context.findOne(Product, {
        where: { id: product_id },
      });
      if (!product) {
        throw new NotFoundException('message.product_not_found');
      }
      // check if product in warehouse have quantity
      const product_main_measurement = await context.findOne(
        ProductMeasurement,
        {
          where: {
            product_id,
            is_main_unit: true,
          },
        },
      );
      //* check if product in warehouse have quantity
      const product_warehouse = await context.find(WarehouseProducts, {
        where: { product_id },
      });
      const product_quantities =
        product_warehouse.reduce((acc, cur) => acc + cur.quantity, 0) /
        product_main_measurement.conversion_factor;
      if (product_quantities > 0) {
        throw new BadRequestException(
          'message.product_has_quantity_in_warehouse',
        );
      }
      //* check if product has sub category
      const product_category = await context.find(ProductSubCategory, {
        where: {
          product_id,
        },
      });
      if (product_category.length > 0) {
        throw new BadRequestException('message.product_has_sub_category');
      }

      //* check if product has offers
      const product_offers = await context.find(ProductOffer, {
        where: {
          product_category_price: {
            product_sub_category: {
              product_id,
            },
          },
        },
      });
      if (product_offers.length > 0) {
        throw new BadRequestException('message.product_has_offers');
      }
      //* delete product from warehouse
      await context.update(
        WarehouseProducts,
        { product_id },
        {
          deleted_at: new Date(),
        },
      );
      //* delete product from SubCategory
      await context.update(
        ProductSubCategory,
        { product_id },
        {
          deleted_at: new Date(),
        },
      );

      return await context.softDelete(Product, { id: product_id });
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
