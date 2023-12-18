import { AddressModule } from './address/address.module';

import { Module } from '@nestjs/common';
import { VehicleModule } from './vehicle/vehicle.module';
import { PackageModule } from './package/package.module';
import { ServiceModule } from './service/service.module';
import { UserModule } from './user/user.module';
import { AboutUsModule } from './about-us/about-us.module';
import { SocialMediaModule } from './social-media/social-media.module';
import { ColorModule } from './color/color.module';
import { PackageServicesModule } from './package-services/package-services.module';
import { TermsConditionsModule } from './terms-conditions/terms-conditions.module';
import { PrivacyPolicyModule } from './privacy-policy/privacy-policy.module';
import { QuestionsAnswersModule } from './questions-answers/questions-answers.module';
import { SupportService } from './support/support.service';
import { SupportModule } from './support/support.module';
import { BannerModule } from './banner/banner.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { SlotsModule } from './slots/slots.module';
import { OrderModule } from './order/order.module';
import { BikerModule } from './biker/biker.module';
import { OrderInvoiceModule } from './order-invoice/order-invoice.module';
import { PromoCodeModule } from './promo-code/promo-code.module';
import { VariableModule } from 'src/variable/variable.module';
import { NotificationModule } from './notification/notification.module';
import { GiftModule } from './gift/gift.module';
import { SmsModule } from './sms/sms.module';
import { PaymentModule } from './payment/payment.module';
import { AppConstantsModule } from './app-constants/app-constants.module';
import { CustomerModule } from './customer/customer.module';
import { PointModule } from './point/point.module';
import { ReviewOrderModule } from './review-order/review-order.module';

@Module({
    imports: [
        AddressModule,
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
        OrderModule,
        BikerModule,
        OrderInvoiceModule,
        PromoCodeModule,
        VariableModule,
        NotificationModule,
        GiftModule,
        SmsModule,
        PaymentModule,
        AppConstantsModule,
        CustomerModule,
        PointModule,
        ReviewOrderModule
    ],
    exports: [
        AddressModule,
        VehicleModule
    ],
    providers: [SupportService],
})
export class AssemblyModule { }
