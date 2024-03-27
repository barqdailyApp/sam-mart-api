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
import { CreateProductRequest } from '../../product/dto/request/create-product.request';
import { StorageManager } from 'src/integration/storage/storage.manager';
import { ImageManager } from 'src/integration/sharp/image.manager';
import * as sharp from 'sharp';
import { ProductImage } from 'src/infrastructure/entities/product/product-image.entity';
import { ProductMeasurement } from 'src/infrastructure/entities/product/product-measurement.entity';
import { MeasurementUnitService } from 'src/modules/measurement-unit/measurement-unit.service';
import { CreateProductMeasurementRequest } from '../../product/dto/request/create-product-measurement.request';
import {
  ensureFilesExists,
  moveTmpFile,
  moveTmpFiles,
} from 'src/core/helpers/file.helper';
import { UpdateProductRequest } from '../../product/dto/request/update-product.request';
import { ProductOffer } from 'src/infrastructure/entities/product/product-offer.entity';
import { DiscountType } from 'src/infrastructure/data/enums/discount-type.enum';
import { ProductMeasurementRequest } from '../dto/request/product-measurement.request';
import { ProductSubCategory } from 'src/infrastructure/entities/product/product-sub-category.entity';
import { ProductCategoryPrice } from 'src/infrastructure/entities/product/product-category-price.entity';

@Injectable()
export class ProductPriceTransaction extends BaseTransaction<
  {
    product_sub_category_id: string;
    measurement_detail: ProductMeasurementRequest;
  },
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
    query: {
      product_sub_category_id: string;
      measurement_detail: ProductMeasurementRequest;
    },
    context: EntityManager,
  ): Promise<ProductCategoryPrice> {
    try {
      const { measurement_detail, product_sub_category_id } = query;
      const {
        max_order_quantity,
        min_order_quantity,
        price,
        product_measurement_id,
      } = measurement_detail;
      //*--------------------------------- Make Check For User Data ---------------------------------*/
      //* Check if product sub category id exist
      const productSubCategory = await context.findOne(ProductSubCategory, {
        where: {
          id: product_sub_category_id,
        },
      });
      if (!productSubCategory) {
        throw new NotFoundException(
          'message.product_sub_category_id_not_found',
        );
      }
      //* Check  product measurement id
      const productMeasurement = await context.findOne(ProductMeasurement, {
        where: { id: product_measurement_id },
      });
      if (!productMeasurement) {
        throw new NotFoundException('message.product_measurement_not_found');
      }

      //*-------------------------- Check if product category price exist , will update it -------------------*/
      const productCategoryPrice = await context.findOne(ProductCategoryPrice, {
        where: {
          product_measurement_id: product_measurement_id,
          product_sub_category_id: productSubCategory.id,
        },
      });
      if (productCategoryPrice) {
        productCategoryPrice.price = price;
        productCategoryPrice.min_order_quantity = min_order_quantity;
        productCategoryPrice.max_order_quantity = max_order_quantity;
        const productCategoryPriceSaved = await context.save(
          productCategoryPrice,
        );
        //* Update price for offers
        const offers = await context.find(ProductOffer, {
          where: {
            product_category_price_id: productCategoryPriceSaved.id,
          },
        });
        for (const offer of offers) {
          if (offer.discount_type == DiscountType.VALUE) {
            if (offer.discount_value == productCategoryPriceSaved.price) {
              throw new BadRequestException(
                'message.discount_value_must_be_less_than_price',
              );
            }
            offer.price =
              productCategoryPriceSaved.price - offer.discount_value;
          } else {
            if (offer.discount_value >= 100) {
              throw new BadRequestException(
                'message.discount_value_must_be_less_than_100',
              );
            }
            const discountedPercentage =
              (productCategoryPriceSaved.price * offer.discount_value) / 100;
            offer.price =
              productCategoryPriceSaved.price - discountedPercentage;
          }
          await context.update(
            ProductOffer,
            { id: offer.id },
            { price: offer.price },
          );
        }
        return productCategoryPriceSaved;
      }
      //* -------------------------- Create product category price if Not Exist --------------------------*/

      const createProductCategoryPrice = context.create(ProductCategoryPrice, {
        product_measurement_id,
        product_sub_category_id: productSubCategory.id,
        price,
        min_order_quantity,
        max_order_quantity,
      });
      const productCategoryPriceSaved = await context.save(
        createProductCategoryPrice,
      );

      return productCategoryPriceSaved;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
