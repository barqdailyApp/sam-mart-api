import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { CreateProductTransaction } from './utils/create-product.transaction';
import { MeasurementUnitModule } from '../measurement-unit/measurement-unit.module';
import { SubcategoryService } from '../subcategory/subcategory.service';

@Module({
  controllers: [ProductController],
  providers: [
    ProductService,
    CreateProductTransaction,
    SubcategoryService,
  ],
  imports: [MeasurementUnitModule],
  exports: [ProductService],
})
export class ProductModule {}
