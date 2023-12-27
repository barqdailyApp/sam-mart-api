import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { AddProductTransaction } from './utils/add-product.transaction';
import { MeasurementUnitModule } from '../measurement-unit/measurement-unit.module';
import { UpdateProductTransaction } from './utils/update-product.transaction';
import { UpdateProductMeasurementTransaction } from './utils/update-product-measurment.transaction';

@Module({
  controllers: [ProductController],
  providers: [ProductService, AddProductTransaction,UpdateProductTransaction,UpdateProductMeasurementTransaction],
  imports: [MeasurementUnitModule],
  exports: [ProductService,],
})
export class ProductModule {}
