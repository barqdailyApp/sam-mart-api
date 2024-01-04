import { Module } from '@nestjs/common';
import { ProductCategoryPriceController } from './product-category-price.controller';
import { ProductCategoryPriceService } from './product-category-price.service';

@Module({
  controllers: [ProductCategoryPriceController],
  providers: [ProductCategoryPriceService],
})
export class ProductCategoryPriceModule {}
