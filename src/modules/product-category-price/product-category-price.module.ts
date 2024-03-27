import { Module } from '@nestjs/common';
import { ProductCategoryPriceController } from './product-category-price.controller';
import { ProductCategoryPriceService } from './product-category-price.service';
import { ProductPriceTransaction } from './utils/product-price.transaction';

@Module({
  controllers: [ProductCategoryPriceController],
  providers: [ProductCategoryPriceService,ProductPriceTransaction],
})
export class ProductCategoryPriceModule {}
