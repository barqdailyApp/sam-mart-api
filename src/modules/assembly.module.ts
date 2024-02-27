import { Module } from "@nestjs/common";
import { AdditionalServiceModule } from "./additional-service/additional-service.module";
import { AuthenticationModule } from "./authentication/authentication.module";
import { BanarModule } from "./banar/banar.module";
import { CartModule } from "./cart/cart.module";
import { CategoryModule } from "./category/category.module";
import { CityModule } from "./city/city.module";
import { CountryModule } from "./country/country.module";
import { DriverModule } from "./driver/driver.module";
import { MeasurementUnitModule } from "./measurement-unit/measurement-unit.module";
import { ProductCategoryPriceModule } from "./product-category-price/product-category-price.module";
import { ProductModule } from "./product/product.module";
import { RegionModule } from "./region/region.module";
import { SectionModule } from "./section/section.module";
import { StaticPageModule } from "./static-page/static-page.module";
import { SubcategoryModule } from "./subcategory/subcategory.module";
import { SupportTicketModule } from "./support-ticket/suuport-ticket.module";
import { UserModule } from "./user/user.module";
import { WarehouseModule } from "./warehouse/warehouse.module";
import { SlotModule } from './slot/slot.module';
import { OrderModule } from './order/order.module';
import { EmployeeModule } from "./employee/employee.module";
import { WorkingAreaModule } from './working-area/working-area.module';
import { TransactionModule } from './transaction/transaction.module';


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
    SupportTicketModule,
    StaticPageModule,
    CartModule,
    SlotModule,
    OrderModule,
    EmployeeModule,
    WorkingAreaModule,
    TransactionModule,
  ],
  exports: [],
  providers: [],
})
export class AssemblyModule {}
