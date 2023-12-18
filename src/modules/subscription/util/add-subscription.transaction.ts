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
import { Package } from 'src/infrastructure/entities/package/package.entity';
import { Subscription } from 'src/infrastructure/entities/subscription/subscription.entity';
import { SubscriptionPackageService } from 'src/infrastructure/entities/subscription/subscription-service.entity';
import { v4 as uuidv4 } from 'uuid';
import { User } from 'src/infrastructure/entities/user/user.entity';
import { SubscriptionRequest } from '../dto/subscription-request';

import { Service } from 'src/infrastructure/entities/package/service.entity';
import { OrderInvoice } from 'src/infrastructure/entities/order/order-invoice.entity';
import { PromoCode } from 'src/infrastructure/entities/promo-code/promo-code.entity';
import { AppConstants } from 'src/infrastructure/entities/app-constants/app-constants.entity';
import { toUrl } from 'src/core/helpers/file.helper';

@Injectable()
export class AddSubscriptionTransaction extends BaseTransaction<
  SubscriptionRequest,
  Subscription
> {
  constructor(
    dataSource: DataSource,
    @Inject(REQUEST) readonly request: Request,
  ) {
    super(dataSource);
  }

  // the important thing here is to use the manager that we've created in the base class
  protected async execute(
    request: SubscriptionRequest,
    context: EntityManager,
  ): Promise<Subscription> {
    try {
      const user = await context.findOne(User, {
        where: { id: request.user_id },
        relations: ['customer'],
      });
      const get_package = await context.findOne(Package, {
        where: [{ id: request.package_id }],
        relations: ['package_service.service'],
      });
      //* Full All Information Subscription Entity by Selected package
      let subscription = new Subscription({ ...get_package });
      subscription.total_was_count = get_package.wash_count;
      subscription.id = uuidv4();
      subscription.reschedule_times = get_package.wash_count;
      subscription.customer_id = user.customer.id;
      const expire_date = this.add30DaysToDate(
        new Date(),
        get_package.expiry_date_in_days,
      );
      subscription.expiry_date = expire_date;
      let promo_code_current: PromoCode = null;
      if (request.promo_code_id) {
        promo_code_current = await context.findOne(PromoCode, {
          where: {
            id: request.promo_code_id,
          },
          relations: { users: true },
        });

        if (!promo_code_current) {
          console.log('error', promo_code_current);

          throw new NotFoundException('message.promo_code_not_found');
        }
        const subscription_promo_codes = await context.find(Subscription, {
          where: {
            customer_id: user.customer.id,
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
        promo_code_current.users.push(user);
        promo_code_current.current_uses += 1;
        await context.save(promo_code_current);
      }
      subscription.promo_code = promo_code_current;
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
      if (request.services.length > 0) {
        for (let index = 0; index < request.services.length; index++) {
          const service = await context.findOneBy(Service, {
            id: request.services[index],
          });
          if (service) {
            total_price_extra_service += Number(service.price);
            const save_service = new SubscriptionPackageService({
              service_count: 1,
              service_id: request.services[index],
              total_service_count: 1,
              ...service,
              subscription_id: subscription.id,
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
      
      const total_price_without_vat = total_price_with_vat /(1+ Number(vat));
      let promo_code_amount = 0;
      if (promo_code_current) {
        promo_code_amount =
          total_price_without_vat * promo_code_current.discount;
      }

      const vat_amount = (total_price_without_vat - promo_code_amount) * vat;
      const total_price_net =
        total_price_without_vat - promo_code_amount + vat_amount;

  console.log('logo_app',logo_app)
  console.log('company_address',company_address)

      const order_invoice_create = context.create(OrderInvoice, {
        total_price: total_price_without_vat- promo_code_amount,
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
      return subscription;
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
