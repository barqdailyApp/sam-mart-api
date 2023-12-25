import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { AddProductTransaction } from './utils/add-product.transaction';
import { MeasurementUnitModule } from '../measurement-unit/measurement-unit.module';

@Module({
  controllers: [ProductController],
  providers: [ProductService,AddProductTransaction],
  imports: [MeasurementUnitModule],
  exports: [
    ProductService,
],
})
export class ProductModule {}
