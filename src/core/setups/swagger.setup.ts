import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Vehicle } from 'src/infrastructure/entities/vehicle/vehicle.entity';
import { AboutUsModule } from 'src/modules/about-us/about-us.module';
import { AddressModule } from 'src/modules/address/address.module';
import { AppConstantsModule } from 'src/modules/app-constants/app-constants.module';
import { AuthenticationModule } from 'src/modules/authentication/authentication.module';
import { BannerModule } from 'src/modules/banner/banner.module';
import { BikerModule } from 'src/modules/biker/biker.module';
import { ColorModule } from 'src/modules/color/color.module';
import { CustomerModule } from 'src/modules/customer/customer.module';
import { FileModule } from 'src/modules/file/file.module';
import { GiftModule } from 'src/modules/gift/gift.module';
import { NotificationModule } from 'src/modules/notification/notification.module';
import { OrderInvoiceModule } from 'src/modules/order-invoice/order-invoice.module';
import { OrderModule } from 'src/modules/order/order.module';
import { PackageServicesModule } from 'src/modules/package-services/package-services.module';
import { PackageModule } from 'src/modules/package/package.module';
import { PointModule } from 'src/modules/point/point.module';
import { PrivacyPolicyModule } from 'src/modules/privacy-policy/privacy-policy.module';
import { PromoCodeModule } from 'src/modules/promo-code/promo-code.module';
import { QuestionsAnswersModule } from 'src/modules/questions-answers/questions-answers.module';
import { ReviewOrderModule } from 'src/modules/review-order/review-order.module';
import { ServiceModule } from 'src/modules/service/service.module';
import { SlotsModule } from 'src/modules/slots/slots.module';
import { SocialMediaModule } from 'src/modules/social-media/social-media.module';
import { SubscriptionModule } from 'src/modules/subscription/subscription.module';
import { SupportModule } from 'src/modules/support/support.module';
import { TermsConditionsModule } from 'src/modules/terms-conditions/terms-conditions.module';
import { UserModule } from 'src/modules/user/user.module';
import { VehicleModule } from 'src/modules/vehicle/vehicle.module';
import { VariableModule } from 'src/variable/variable.module';

export default (app: INestApplication, config: ConfigService) => {
  const operationIdFactory = (controllerKey: string, methodKey: string) =>
    methodKey;

  const publicConfig = new DocumentBuilder()
    .addBearerAuth()
    .setTitle(`${config.get('APP_NAME')} API`)
    .setDescription(`${config.get('APP_NAME')} API description`)
    .setVersion('v1')
    .setContact(
      'Contact',
      'https://github.com/mahkassem',
      'mahmoud.ali.kassem@gmail.com',
    )
    .setLicense('Developed by Mahmoud Kassem', 'https://github.com/mahkassem')
    .addServer(config.get('APP_HOST'))
    .build();

  const publicDocument = SwaggerModule.createDocument(app, publicConfig, {
    include: [
      AuthenticationModule,
      UserModule,
      AddressModule,
      FileModule,
      VehicleModule,
      PackageModule,
      ServiceModule,
      UserModule,
      AboutUsModule,
      SocialMediaModule,
      ColorModule,
      PackageServicesModule,
      TermsConditionsModule,
      PrivacyPolicyModule,
      QuestionsAnswersModule,
      SupportModule,
      BannerModule,
      SubscriptionModule,
      SlotsModule,
      BikerModule,
      OrderModule,
      OrderInvoiceModule,
      PromoCodeModule,
      VariableModule,
      GiftModule,
      AppConstantsModule,
      CustomerModule,
      PointModule,
      NotificationModule,
      ReviewOrderModule
    ],
    operationIdFactory,
  });

  SwaggerModule.setup('swagger', app, publicDocument);
};
