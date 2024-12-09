import { Module } from '@nestjs/common';
import { ProductDashboardController } from './product-dashboard.controller';
import { ProductDashboardService } from './product-dashboard.service';
import { CreateProductTransaction } from './utils/create-product.transaction';
import { MeasurementUnitModule } from '../measurement-unit/measurement-unit.module';
import { SubcategoryService } from '../subcategory/subcategory.service';
import { ProductClientService } from './product-client.service';
import { ProductClientController } from './product-client.controller';
import { NotificationModule } from '../notification/notification.module';
import { DeleteProductTransaction } from './utils/delete-product.transaction';
import { BrandService } from './brand.service';
import { ProductChangesService } from './product-changes.service';

@Module({
  controllers: [ProductDashboardController, ProductClientController],
  providers: [
    CreateProductTransaction,
    SubcategoryService,
    ProductClientService,
    ProductDashboardService,
    DeleteProductTransaction,
    BrandService,
    ProductChangesService
  ],
  imports: [MeasurementUnitModule,NotificationModule],
  exports: [],
})
export class ProductModule {}
