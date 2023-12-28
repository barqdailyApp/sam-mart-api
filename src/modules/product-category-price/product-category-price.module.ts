import { Module } from '@nestjs/common';
import { ProductCategoryPriceController } from './product-category-price.controller';
import { ProductCategoryPriceService } from './product-category-price.service';
import { CreateProductCategoryPriceTransaction } from './utils/create-product-category-price.transaction';
import { UpdateProductCategoryPriceTransaction } from './utils/update-product-category-price.transaction';

@Module({
  controllers: [ProductCategoryPriceController],
  providers: [
    ProductCategoryPriceService,
    CreateProductCategoryPriceTransaction,
    UpdateProductCategoryPriceTransaction,
  ],
})
export class ProductCategoryPriceModule {}
