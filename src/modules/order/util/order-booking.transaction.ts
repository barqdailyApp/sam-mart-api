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
import { NotificationService } from 'src/modules/notification/services/notification.service';
import { Location } from 'src/core/helpers/geom.helper';
import { NotificationEntity } from 'src/infrastructure/entities/notification/notification.entity';
import { NotificationTypes } from 'src/infrastructure/data/enums/notification-types.enum';

import { Slot } from 'src/infrastructure/entities/slot/slot.entity';
import { string } from 'joi';
import { SlotObject, findNearestPoints } from 'src/core/helpers/geom.helper';
@Injectable()
export class OrderBookingTransaction extends BaseTransaction<
  OrderBookingRequest,
  Order
> {
  constructor(
    dataSource: DataSource,
    @Inject(REQUEST) readonly request: Request,
    @Inject(NotificationService)
    public readonly notificationService: NotificationService,
  ) {
    super(dataSource);
  }

  // the important thing here is to use the manager that we've created in the base class
  protected async execute(
    query: OrderBookingRequest,
    context: EntityManager,
  ): Promise<Order> {
   
    try {

      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const date = String(today.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${date}`;
      const customer =
        this.request.user == null
          ? null
          : await context.findOneBy(Customer, {
              user_id: this.request.user.id,
            });
      const subscription = await context.findOne(Subscription, {
        where: {
          id: query.subscription_id,
         
        },
        relations: ['service'],
      });
     

      if (subscription.wash_count < 1) {
        throw new BadRequestException('message.washes_finished');
      }
      if (subscription.expiry_date < new Date())
        throw new BadRequestException('message.subscription_expired');
      let available_bikers = await context.find(Biker,{where:{is_active:true}});
      available_bikers= available_bikers.filter((e)=>{
        if(new Date()> e.in_active_start_date  && new Date()< e.in_active_end_date  )
        return
      return e
      })
    
      const slot = await context.findOne(Slot, {
        where: { id: query.slot_id, orders: { order_date: query.order_date ,status:Not(OrderStatus.CANCELLED)} },
        relations: { orders: true },
      });

      if(available_bikers.length==0)
      throw new BadRequestException('no available bikers');
      if (slot != null) {
        if (slot.orders.length >= available_bikers.length)
          throw new BadRequestException('no available bikers');
      }
      const order = plainToInstance(Order, query);

      order.status = OrderStatus.CREATED;
      order.customer_id = customer == null ? query.customer_id : customer.id;

      const order_invoice = await context.findOneBy(OrderInvoice, {
        subscription_id: subscription.id,
      });
      const count = await context
        .createQueryBuilder(Order, 'order')
        //*It checks if the date of the "created_at" field of the "order" entity is equal to the current date
        // DATE : extracts the date portion from the 'created_at' column in the 'order' table
        .where('DATE(order.created_at) = CURDATE()')
        .getCount();
      order.number = generateOrderNumber(count);
      order.order_invoice_id = order_invoice.id;
      order.wash_count_current =
        subscription.total_was_count - subscription.wash_count + 1;
      await context.save(order);
      subscription.wash_count = subscription.wash_count - 1;
if(subscription.wash_count==0)
subscription.status=SubscriptionStatus.EMPTY
      await context.save(order);

      order.services = [];

      if (query.services) {
        await Promise.all(
          subscription.service.map(async (e) => {
            if (query.services.includes(e.service_id)) {
              const used_service = await context.findOne(
                SubscriptionPackageService,
                { where: { id: e.id, subscription_id: subscription.id } },
              );
              const order_service = new OrderServices({
                ...e,
                order_id: order.id,
              });
              order_service.id = uuidv4();
              await context.save(order_service);

              used_service.service_count = used_service.service_count - 1;
              await context.save(used_service);
            }
          }),
        );
      }

      await context.save(subscription);
      try {
        if (subscription.expiry_date < new Date()) {
          subscription.status = SubscriptionStatus.EMPTY;
          if(this.request.user.notification_is_active){
            await this.notificationService.create(
              new NotificationEntity({
                user_id: this.request.user.id,
                url: this.request.user.id,
                type: NotificationTypes.SUBSCRIPTION_EXPIRY,
                title_ar: 'الاشتراك',
                title_en: 'Subscription',
                text_ar: 'لقد انتهت صلاحية الاشتراك للباقة',
                text_en: 'Package has been expired',
              }),
            );
          }
         
          await context.save(subscription);
        }
      } catch (e) {}
      if (formattedDate == query.order_date) {
        const cluster: Location[][] = [
          ...available_bikers.map((e) => [
            new Location({
              latitude: e.start_latitude,
              longitude: e.start_longitude,
            }),
          ]),
        ];

        const fixed_orders = await context.find(Order, {
          where: {
            order_date: formattedDate,
            status: Not(
              OrderStatus.CREATED ||
                OrderStatus.CANCELLED ||
                OrderStatus.COMPLETED,
            ),
          },
        });
        const slots = await context.find(Slot, {
          order: { start_time: 'ASC' },
          relations: { orders: { address: true } },

          where: {
            orders: { order_date: formattedDate, status: OrderStatus.CREATED },
          },
        });

        for (let index = 0; index < slots.length; index++) {
          const points = findNearestPoints(
            slots[index].orders.map(
              (e) =>
                new Location({
                  id: e.id,
                  latitude: e.address.latitude,
                  longitude: e.address.longitude,
                }),
            ),

            cluster.map((e) => {
              const busy_biker: SlotObject= {
                biker_id: available_bikers[cluster.indexOf(e)].id,
                slot_id: slots[index].id,
              };
              if (
                fixed_orders
                  .map((e) => new SlotObject({biker_id:e.biker_id,slot_id:e.slot_id}))
                  .includes(busy_biker)
              )
              return
                return cluster[cluster.indexOf(e)][
                  cluster[cluster.indexOf(e)].length - 1
                ];
            }),
          );
          for (let index = 0; index < cluster.length; index++) {
            points.forEach((e) => {
              if (cluster[index].includes(e[1])) cluster[index].push(e[0]);
            });
          }

          for (let index = 0; index < cluster.length; index++) {
            const orders = await context.find(Order, {
              where: { id: In(cluster[index].map((e) => e.id)) },
            });
            orders.map((e) => (e.biker_id = available_bikers[index].id));
            await context.save(orders);
          }
        }
      }

      return order;
    } catch (error) {
      throw new BadRequestException(error);
    }

    // Create location objects
  }
}

