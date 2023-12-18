import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { BaseTransaction } from 'src/core/base/database/base.transaction';
import { DataSource, EntityManager, In, Not } from 'typeorm';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';
import { Package } from 'src/infrastructure/entities/package/package.entity';
import { Subscription } from 'src/infrastructure/entities/subscription/subscription.entity';
import { SubscriptionPackageService } from 'src/infrastructure/entities/subscription/subscription-service.entity';
import { v4 as uuidv4 } from 'uuid';
import { User } from 'src/infrastructure/entities/user/user.entity';
import { OrderBookingRequest } from '../dto/requests/order-booking-request';
import { plainToInstance } from 'class-transformer';
import { Order } from 'src/infrastructure/entities/order/order.entity';
import { OrderStatus } from 'src/infrastructure/data/enums/order-status.enum';
import { Address } from 'src/infrastructure/entities/user/address.entity';
import { Biker } from 'src/infrastructure/entities/biker/biker.entity';
import { generateOrderNumber } from './order.utils';
import { Customer } from 'src/infrastructure/entities/customer/customer.entity';
import { OrderServices } from 'src/infrastructure/entities/order/order-services';
import { OrderInvoice } from 'src/infrastructure/entities/order/order-invoice.entity';
import { SubscriptionStatus } from 'src/infrastructure/data/enums/subscription.enum';
import { NotificationEntity } from 'src/infrastructure/entities/notification/notification.entity';
import { NotificationService } from 'src/modules/notification/services/notification.service';
import { NotificationTypes } from 'src/infrastructure/data/enums/notification-types.enum';
import { PackagesServices } from 'src/infrastructure/entities/package/packages-services';
import { OrderResponse } from '../dto/response/order-response';
import { OrderGateway } from 'src/integration/gateways/order.gateway';
import { Gateways } from 'src/core/base/gateways';
import { I18nResponse } from 'src/core/helpers/i18n.helper';
@Injectable()
export class OrderRescheduleTransaction extends BaseTransaction<
  string,
  Subscription
> {
  constructor(
    dataSource: DataSource,
    @Inject(REQUEST) readonly request: Request,
    @Inject(NotificationService)
    public readonly notificationService: NotificationService,
    @Inject(OrderGateway) private orderGateway: OrderGateway,
    @Inject(I18nResponse) private readonly _i18nResponse: I18nResponse,


  ) {
    super(dataSource);
  }

  // the important thing here is to use the manager that we've created in the base class
  protected async execute(
    query: string,
    context: EntityManager,
  ): Promise<Subscription> {
    try {
      const customer = await context.findOneBy(Customer, {
        user_id: this.request.user.id,
      });

      const order_current = await context.findOne(Order, {
        where: { id: query },
        relations: {
          services: true,
          subscription: true,
          slot: true,
          vehicle: {
            color: true,
            images: true,
            brand_model: true,
            brand: true,
          },
          order_invoice: {
            subscription: {
              service: true,
            },
          },
          address: true,
          customer: { user: true },
          biker: { user: true },
        },
      });

      
      // if (
      //   Number(new Date().getTime() - new Date(order.order_date).getTime()) /
      //     (60 * 60 * 1000) <
      //   24
      // )
      //   throw new BadRequestException();
      const subscription = await context.findOne(Subscription, {
        where: { id: order_current.subscription_id, customer_id: customer.id },
        relations: ['service'],
      });
      if (subscription.reschedule_times == 0) throw new BadRequestException();

      subscription.wash_count ++;
      subscription.reschedule_times --;
   
      if (order_current.services.length != 0) {
        console.log('enter if services ');
        const order_service_ids = order_current.services.map((e) => e.service_id);
        console.log(order_service_ids)
  const service = await context.find(SubscriptionPackageService,{where: { subscription_id:subscription.id,service_id :In(order_service_ids)}})
       service.map((e)=>{e.service_count++})
       console.log(service)
      await context.save(service)
     
      subscription.status = SubscriptionStatus.ACTIVE;
      await subscription.save();
      }

      if (subscription.total_was_count == 1) {
        subscription.status = SubscriptionStatus.RESCHEDULED;
        subscription.expiry_date = new Date(
          new Date().getTime() + 30 * 60 * 60 * 24 * 1000,
        );
      }
      order_current.number = `${order_current.number}-r`;
      if(order_current.customer.user.notification_is_active){
        await this.notificationService.create(
          new NotificationEntity({
            user_id: order_current.customer.user.id,
            url: order_current.customer.user.id,
            type: NotificationTypes.SCHEDULED,
            title_ar: 'إعادة جدولة',
            title_en: 'Reschedule',
            text_ar: 'لقد تمت إعادة الجدولة للغسلة بنجاح !',
            text_en: 'Your car wash has been rescheduled successfully !',
          }),
        );
      }
      
      await context.save(order_current);
      await context.softRemove(order_current);

      

      if(order_current.biker_id){
        const order_socket = new OrderResponse(order_current);

          const today = new  Date()
          .toISOString()
          .split('T')[0];
          const all_orders_biker =  await context.find(Order,{
            where: {
              biker_id:order_socket.biker.id,
              order_date: today,
            },
            relations: {
              services: true,
              subscription: true,
              slot: true,
              vehicle: {
                color: true,
                images: true,
                brand_model: true,
                brand: true,
              },
              order_invoice: {
                subscription: {
                  service: true,
                },
              },
              address: true,
              customer: { user: true },
              biker: { user: true },
            },
            order: {
              slot: {
                start_time: 'ASC',
              },
            },
          });
          const all_orders_biker_res = all_orders_biker.map(order=> new OrderResponse(order));

        this.orderGateway.server.emit(
          `${Gateways.Order.UserId}${order_current.biker.user_id}`,
          {
            action: 'ORDER_RESCEDULED',
            data: {
              order_id: order_current.id,
              message: this._i18nResponse.entity(all_orders_biker_res),
            },
          },
        );
      }


      return await context.save(subscription);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
