import { Module } from '@nestjs/common';

import { UserModule } from './user/user.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { CountryModule } from './country/country.module';
import { CityModule } from './city/city.module';
import { RegionModule } from './region/region.module';
import { DriverModule } from './driver/driver.module';
import { ProductModule } from './product/product.module';
import { MeasurementUnitModule } from './measurement-unit/measurement-unit.module';
import { AdditionalServiceModule } from './additional-service/additional-service.module';
import { SectionModule } from './section/section.module';
import { CategoryModule } from './category/category.module';
import { SubcategoryModule } from './subcategory/subcategory.module';
import { ProductCategoryPriceModule } from './product-category-price/product-category-price.module';
import { BanarModule } from './banar/banar.module';
import { WarehouseModule } from './warehouse/warehouse.module';
import { CartModule } from './cart/cart.module';


@Module({
  imports: [
    UserModule,
    AuthenticationModule,
    CountryModule,
    CityModule,
    RegionModule,
    DriverModule,
    ProductModule,
    MeasurementUnitModule,
    AdditionalServiceModule,
    SectionModule,
    CategoryModule,
    SubcategoryModule,
    ProductCategoryPriceModule,
    BanarModule,
    WarehouseModule,
    CartModule

  ],
  exports: [],
  providers: [],
})
export class AssemblyModule {}
