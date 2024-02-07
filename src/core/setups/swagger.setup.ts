import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Subcategory } from 'src/infrastructure/entities/category/subcategory.entity';
import { AdditionalServiceModule } from 'src/modules/additional-service/additional-service.module';
import { AddressModule } from 'src/modules/address/address.module';

import { AuthenticationModule } from 'src/modules/authentication/authentication.module';
import { BanarModule } from 'src/modules/banar/banar.module';
import { CartModule } from 'src/modules/cart/cart.module';
import { CategoryModule } from 'src/modules/category/category.module';
import { CityModule } from 'src/modules/city/city.module';
import { CountryModule } from 'src/modules/country/country.module';
import { DriverModule } from 'src/modules/driver/driver.module';
import { EmployeeModule } from 'src/modules/employee/employee.module';
import { FileModule } from 'src/modules/file/file.module';
import { MeasurementUnitModule } from 'src/modules/measurement-unit/measurement-unit.module';
import { OrderModule } from 'src/modules/order/order.module';
import { ShipmentController } from 'src/modules/order/shipment.controller';
import { ProductCategoryPriceModule } from 'src/modules/product-category-price/product-category-price.module';
import { ProductModule } from 'src/modules/product/product.module';
import { RegionModule } from 'src/modules/region/region.module';
import { SectionModule } from 'src/modules/section/section.module';
import { SlotModule } from 'src/modules/slot/slot.module';
import { StaticPageModule } from 'src/modules/static-page/static-page.module';
import { SubcategoryModule } from 'src/modules/subcategory/subcategory.module';
import { SupportTicketModule } from 'src/modules/support-ticket/suuport-ticket.module';
import { UserModule } from 'src/modules/user/user.module';
import { WarehouseModule } from 'src/modules/warehouse/warehouse.module';

export default (app: INestApplication, config: ConfigService) => {
  const operationIdFactory = (controllerKey: string, methodKey: string) =>
    methodKey;

  const publicConfig = new DocumentBuilder()
    .addBearerAuth()
    .setTitle(`${config.get('APP_NAME')} API`)
    .setDescription(`${config.get('APP_NAME')} API description`)
    .setVersion('v1')
    .addServer(config.get('APP_HOST'))
    .build();

  const publicDocument = SwaggerModule.createDocument(app, publicConfig, {
    include: [
      UserModule,
      AuthenticationModule,
      AddressModule,
      CountryModule,
      CityModule,
      RegionModule,
      DriverModule,
      MeasurementUnitModule,
      AdditionalServiceModule,
      ProductModule,
      FileModule,
      DriverModule,
      SectionModule,
      CategoryModule,
      SubcategoryModule,
      ProductCategoryPriceModule,
      BanarModule,
      WarehouseModule,
      CartModule,
      SupportTicketModule,
      StaticPageModule,
      SlotModule,
      OrderModule,
      EmployeeModule,
      ShipmentController
    ],
    operationIdFactory,
  });

  SwaggerModule.setup('swagger', app, publicDocument);
};
