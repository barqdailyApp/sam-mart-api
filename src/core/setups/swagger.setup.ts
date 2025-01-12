import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { PaymentMethod } from 'src/infrastructure/entities/payment_method/payment_method.entity';
import { PromoCode } from 'src/infrastructure/entities/promo-code/promo-code.entity';
import { FoodBanar } from 'src/infrastructure/entities/restaurant/food_banar.entity';
import { RestaurantCart } from 'src/infrastructure/entities/restaurant/restaurant-cart.entity';
import { Restaurant } from 'src/infrastructure/entities/restaurant/restaurant.entity';

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
import { FoodBanarModule } from 'src/modules/food-banar/food-banar.module';
import { MeasurementUnitModule } from 'src/modules/measurement-unit/measurement-unit.module';
import { NotificationModule } from 'src/modules/notification/notification.module';
import { OrderModule } from 'src/modules/order/order.module';
import { ShipmentController } from 'src/modules/order/shipment.controller';
import { PaymentMethodModule } from 'src/modules/payment_method/payment_method.module';
import { ProductCategoryPriceModule } from 'src/modules/product-category-price/product-category-price.module';
import { ProductModule } from 'src/modules/product/product.module';
import { PromoCodeModule } from 'src/modules/promo-code/promo-code.module';
import { ReasonModule } from 'src/modules/reason/reason.module';
import { RegionModule } from 'src/modules/region/region.module';
import { RestaurantCartModule } from 'src/modules/restaurant-cart/restaurant-cart.module';
import { RestaurantModule } from 'src/modules/restaurant/restaurant.module';
import { SectionModule } from 'src/modules/section/section.module';
import { SlotModule } from 'src/modules/slot/slot.module';
import { StaticPageModule } from 'src/modules/static-page/static-page.module';
import { SubcategoryModule } from 'src/modules/subcategory/subcategory.module';
import { SupportTicketModule } from 'src/modules/support-ticket/suuport-ticket.module';
import { TransactionModule } from 'src/modules/transaction/transaction.module';
import { UserModule } from 'src/modules/user/user.module';
import { WarehouseModule } from 'src/modules/warehouse/warehouse.module';
import { WorkingAreaModule } from 'src/modules/working-area/working-area.module';

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
      ShipmentController,
      WorkingAreaModule,
      NotificationModule,
      PaymentMethodModule,
      ReasonModule,
      TransactionModule,
      PromoCodeModule,
    ],
    operationIdFactory,

  });

  SwaggerModule.setup('swagger', app, publicDocument);

  const foodConfig = new DocumentBuilder()
  .addBearerAuth()
  .setTitle(`${config.get('APP_NAME')} API`)
  .setDescription(`${config.get('APP_NAME')} API description`)
  .setVersion('v1')
  .addServer(config.get('APP_HOST'))
  .build();

const foodDocument = SwaggerModule.createDocument(app, foodConfig, {
  include: [
   RestaurantModule,
   FoodBanarModule,
   RestaurantCartModule
  ],
  operationIdFactory,

});

SwaggerModule.setup('swagger/food', app, foodDocument);
};
