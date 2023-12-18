import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BaseTransaction } from 'src/core/base/database/base.transaction';
import { DataSource, EntityManager } from 'typeorm';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';

import { Gift } from 'src/infrastructure/entities/gift/gift.entity';
import { SendGiftRequest } from '../dto/request/send-gift.request';
import { Subscription } from 'src/infrastructure/entities/subscription/subscription.entity';
import { OrderInvoice } from 'src/infrastructure/entities/order/order-invoice.entity';
import { Package } from 'src/infrastructure/entities/package/package.entity';
import { Service } from 'src/infrastructure/entities/package/service.entity';
import { PromoCode } from 'src/infrastructure/entities/promo-code/promo-code.entity';
import { SubscriptionPackageService } from 'src/infrastructure/entities/subscription/subscription-service.entity';
import { User } from 'src/infrastructure/entities/user/user.entity';
import { AuthenticationService } from 'src/modules/authentication/authentication.service';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { v4 as uuidv4 } from 'uuid';
import { RegisterUserTransaction } from 'src/modules/authentication/transactions/register-user.transaction';
import { SubscriptionStatus } from 'src/infrastructure/data/enums/subscription.enum';
import { NotificationEntity } from 'src/infrastructure/entities/notification/notification.entity';
import { NotificationTypes } from 'src/infrastructure/data/enums/notification-types.enum';
import { NotificationService } from 'src/modules/notification/services/notification.service';
import { SubscriptionRequest } from 'src/modules/subscription/dto/subscription-request';
import { AppConstants } from 'src/infrastructure/entities/app-constants/app-constants.entity';
import { SmsService } from 'src/modules/sms/sms.service';
import { toUrl } from 'src/core/helpers/file.helper';

@Injectable()
export class SendGiftTransaction extends BaseTransaction<
  SendGiftRequest,
  Gift
> {
  constructor(
    dataSource: DataSource,
    @Inject(REQUEST) readonly request: Request,
    @Inject(NotificationService)
    public readonly notificationService: NotificationService,
    @Inject(SmsService) private readonly smsService: SmsService,
  ) {
    super(dataSource);
  }

  // the important thing here is to use the manager that we've created in the base class
  protected async execute(
    request: SubscriptionRequest,
    context: EntityManager,
  ): Promise<Gift> {
    try {
      const {
        receiver_phone_number,
        package_id,
        services,
        promo_code_id,
        message,
        is_new_user,
      } = request;

      const user_sender = await context.findOne(User, {
        where: { id: request.user_id },
        relations: ['customer'],
      });

      const user_receiver = await context.findOne(User, {
        where: { phone: receiver_phone_number },
        relations: ['customer'],
      });

      const get_package = await context.findOne(Package, {
        where: [{ id: package_id }],
        relations: ['package_service.service'],
      });
      //* Full All Information Subscription Entity by Selected package
      let subscription = new Subscription({ ...get_package });
      subscription.total_was_count = get_package.wash_count;
      subscription.reschedule_times = get_package.wash_count;
      subscription.id = uuidv4();
      subscription.customer_id = user_receiver.customer.id;
      const expire_date = this.add30DaysToDate(
        new Date(),
        get_package.expiry_date_in_days,
      );
      subscription.expiry_date = expire_date;
      let promo_code_current: PromoCode = null;
      if (promo_code_id) {
        promo_code_current = await context.findOne(PromoCode, {
          where: {
            id: promo_code_id,
          },
          relations: { users: true },
        });

        if (!promo_code_current) {
          throw new NotFoundException('message.promo_code_not_found');
        }
        const subscription_promo_codes = await context.find(Subscription, {
          where: {
            customer_id: user_receiver.customer.id,
            promo_code_id: promo_code_current.id,
          },
        });

        if (
          subscription_promo_codes.length ===
          promo_code_current.max_use_by_users
        ) {
          throw new NotFoundException('message.promo_Code_reached_limit');
        }

        // if (promo_code_current.current_uses === promo_code_current.max_uses) {
        //   throw new NotFoundException('message.promo_Code_reached_limit');
        // }
        promo_code_current.users.push(user_sender);
        promo_code_current.current_uses += 1;
        await context.save(promo_code_current);
      }
      subscription.promo_code = promo_code_current;
      subscription.status = SubscriptionStatus.Gift;
      
      subscription = await context.save(subscription);

      //* Full All Information SubscriptionPackageService Entity by Selected package Services
      for (let index = 0; index < get_package.package_service.length; index++) {
        const subscription_service = new SubscriptionPackageService({
          price: get_package.package_service[index].service.price,
          service_count: get_package.package_service[index].service_count,
          total_service_count: get_package.package_service[index].service_count,
          ...get_package.package_service[index].service,
          subscription_id: subscription.id,
        });
        subscription_service.service_id =
          get_package.package_service[index].service_id;
        subscription_service.id = uuidv4();
        await context.save(subscription_service);
      }
      //* Add Extra service
      let total_price_extra_service = 0;
      if (services.length > 0) {
        for (let index = 0; index < services.length; index++) {
          const service = await context.findOneBy(Service, {
            id: services[index],
          });
          if (service) {
            total_price_extra_service += Number(service.price);
            const save_service = new SubscriptionPackageService({
              service_count: 1,
              service_id: services[index],
              total_service_count: 1,
              ...service,
              subscription_id: subscription.id,
              id: uuidv4(),
            });
            await context.save(save_service);
          }
        }
      }

      const app_constants = await context
        .createQueryBuilder(AppConstants, 'app-constants')
        .getOne();
      const vat = app_constants.tax_rate;
      const vat_number = app_constants.vat_number;
      const company_address = app_constants.company_address;

      let logo_app = app_constants.logo_app;
      if (logo_app) {
        if (logo_app.includes('assets')) {
          logo_app = toUrl(logo_app, true);
        } else {
          logo_app = toUrl(logo_app);
        }
      }
      const total_price_with_vat = Number(
        Number(subscription.total_price_package) +
          Number(total_price_extra_service),
      );
      const total_price_without_vat = total_price_with_vat / (1 + Number(vat));

      let promo_code_amount = 0;
      if (promo_code_current) {
        promo_code_amount =
          total_price_without_vat * promo_code_current.discount;
      }

      const vat_amount = (total_price_without_vat - promo_code_amount) * vat;
      const total_price_net =
        total_price_without_vat - promo_code_amount + vat_amount;

      const order_invoice_create = context.create(OrderInvoice, {
        total_price: total_price_without_vat - promo_code_amount,
        vat,
        vat_amount,
        total_price_net,
        subscription_id: subscription.id,
        customer_id: subscription.customer_id,
        vat_number,
        logo_app,
        company_address,
        invoice_number: Math.floor(Math.random() * 1000000000).toString(),
        promo_code: promo_code_current,
      });
      const invoice_saved = await context.save(order_invoice_create);
      await context.update(
        Subscription,
        { id: subscription.id },
        { order_invoice: invoice_saved },
      );
      if(user_receiver.notification_is_active){
        await this.notificationService.create(
          new NotificationEntity({
            user_id: user_receiver.id,
            url: user_receiver.id,
            type: NotificationTypes.GIFT,
            title_ar: 'هدية',
            title_en: 'Gift',
            text_ar: 'وصلتك هدية من شخص عزيز عليك !',
            text_en: 'You have received a gift !',
          }),
        );
      }
     
    
        // await this.smsService.sendSMSForGift(
        //   user_receiver.phone,
        //   `وصلتك هدية ${get_package.name_ar} في تطبيق كويكي كلين من شخص عزيز عليك!
    
        //   المرسل حاب يقولك: ${message??''} 
          
        //   حمل تطبيق كويكي كلين وبتحصل الهدية في حسابك واستمتع بتجربة خيالية! 
        //   `,
        //   `You received the ${get_package.name_en} gift in the Quicky Clean application from someone dear to you!
    
        //   The sender would like to tell you: ${message} 
          
        //   Download the Quicky Clean application, get the gift in your account, and enjoy an imaginative experience!`,
        // );
        await this.smsService.sendSMSForGift(
          user_receiver.phone,
          `وصلتك هدية ${get_package.name_ar} في تطبيق كويكي كلين من شخص عزيز عليك!\n\nالمرسل حاب يقولك: ${message??''} \n\n\nحمل تطبيق كويكي كلين وبتحصل الهدية في حسابك واستمتع بتجربة خيالية! \n\nhttps://api.quickyclean.com.sa/v1/about-us/download`,''
          ,
        );

      const gift_create = context.create(Gift, {
        message,
        subscription_id: subscription.id,
        receiver: user_receiver.customer,
        sender: user_sender.customer,
      });

      return await context.save(gift_create);
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error);
    }
  }
  add30DaysToDate(date: Date, expire_date: number): Date {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + expire_date);
    return newDate;
  }
}
