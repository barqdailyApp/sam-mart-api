import { Module } from '@nestjs/common';
import { ProductDashboardController } from './product-dashboard.controller';
import { ProductDashboardService } from './product-dashboard.service';
import { CreateProductTransaction } from './utils/create-product.transaction';
import { MeasurementUnitModule } from '../measurement-unit/measurement-unit.module';
import { SubcategoryService } from '../subcategory/subcategory.service';
import { ProductClientService } from './product-client.service';
import { ProductClientController } from './product-client.controller';

@Module({
  controllers: [ProductDashboardController, ProductClientController],
  providers: [
    CreateProductTransaction,
    SubcategoryService,
    ProductClientService,
    ProductDashboardService,
  ],
  imports: [MeasurementUnitModule],
  exports: [],
})
export class ProductModule {}
