import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { CreateProductTransaction } from './utils/create-product.transaction';
import { MeasurementUnitModule } from '../measurement-unit/measurement-unit.module';
import { UpdateProductTransaction } from './utils/update-product.transaction';
import { UpdateProductMeasurementTransaction } from './utils/update-product-measurment.transaction';
import { UpdateProductImageTransaction } from './utils/update-product-image.transaction';
import { SubcategoryService } from '../subcategory/subcategory.service';

@Module({
  controllers: [ProductController],
  providers: [
    ProductService,
    CreateProductTransaction,
    UpdateProductTransaction,
    UpdateProductMeasurementTransaction,
    UpdateProductImageTransaction,
    SubcategoryService,
  ],
  imports: [MeasurementUnitModule],
  exports: [ProductService],
})
export class ProductModule {}
