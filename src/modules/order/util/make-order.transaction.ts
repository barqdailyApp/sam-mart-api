import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseTransaction } from 'src/core/base/database/base.transaction';
import { jwtSignOptions } from 'src/core/setups/jwt.setup';
import { Otp } from 'src/infrastructure/entities/auth/otp.entity';
import { UserService } from 'src/modules/user/user.service';
import { DataSource, EntityManager, UpdateResult } from 'typeorm';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';
import { UserInfoResponse } from 'src/modules/user/dto/responses/profile.response';
import { MakeOrderRequest } from '../dto/request/make-order-request';
import { Order } from 'src/infrastructure/entities/order/order.entity';
import { Warehouse } from 'src/infrastructure/entities/warehouse/warehouse.entity';
import { Address } from 'src/infrastructure/entities/user/address.entity';

import { Cart } from 'src/infrastructure/entities/cart/cart.entity';
import { CartProduct } from 'src/infrastructure/entities/cart/cart-products';
import { plainToInstance } from 'class-transformer';
import { Shipment } from 'src/infrastructure/entities/order/shipment.entity';
import { ShipmentProduct } from 'src/infrastructure/entities/order/shipment-product.entity';
import { WarehouseOperations } from 'src/infrastructure/entities/warehouse/warehouse-opreations.entity';
import { operationType } from 'src/infrastructure/data/enums/operation-type.enum';
import { WarehouseProducts } from 'src/infrastructure/entities/warehouse/warehouse-products.entity';
import { DeliveryType } from 'src/infrastructure/data/enums/delivery-type.enum';
import { Section } from 'src/infrastructure/entities/section/section.entity';
import { Slot } from 'src/infrastructure/entities/order/slot.entity';
import { ProductOffer } from 'src/infrastructure/entities/product/product-offer.entity';
import { ShipmentStatusEnum } from 'src/infrastructure/data/enums/shipment_status.enum';
import { WarehouseOpreationProducts } from 'src/infrastructure/entities/warehouse/wahouse-opreation-products.entity';
import { OrderGateway } from 'src/integration/gateways/order.gateway';
import { NotificationService } from 'src/modules/notification/notification.service';
import { NotificationEntity } from 'src/infrastructure/entities/notification/notification.entity';
import { NotificationTypes } from 'src/infrastructure/data/enums/notification-types.enum';
import { Driver } from 'src/infrastructure/entities/driver/driver.entity';
import { PaymentMethodEnum } from 'src/infrastructure/data/enums/payment-method';
import { PaymentMethod } from 'src/infrastructure/entities/payment_method/payment_method.entity';
import { PaymentMethodService } from 'src/modules/payment_method/payment_method.service';
import { PromoCodeService } from 'src/modules/promo-code/promo-code.service';
import { TransactionService } from 'src/modules/transaction/transaction.service';
import { MakeTransactionRequest } from 'src/modules/transaction/dto/requests/make-transaction-request';
import { TransactionTypes } from 'src/infrastructure/data/enums/transaction-types';
import { Wallet } from 'src/infrastructure/entities/wallet/wallet.entity';
import { Transaction } from 'src/infrastructure/entities/wallet/transaction.entity';
import { encodeUUID } from 'src/core/helpers/cast.helper';
import * as uuidv4 from 'uuid';
 @Injectable()
export class MakeOrderTransaction extends BaseTransaction<
  MakeOrderRequest,
  Order
> {
  constructor(
    dataSource: DataSource,
    @Inject(REQUEST) readonly request: Request,
    private readonly orderGateway: OrderGateway,
    private readonly notificationService: NotificationService,
    private readonly paymentService: PaymentMethodService,
    private readonly promoCodeService: PromoCodeService,
    private readonly transactionService: TransactionService,
  ) {
    super(dataSource);
  }

  // the important thing here is to use the manager that we've created in the base class
  protected async execute(
    req: MakeOrderRequest,
    context: EntityManager,
  ): Promise<Order> {
    try {
      const section = await context.findOne(Section, {
        where: { id: req.section_id },
      });
      if (!section.delivery_type.includes(req.delivery_type)) {
        throw new BadRequestException(
          'message.section_does_not_support_this_type_of_delivery',
        );
      }

      const user = this.request.user;
      const address = await context.findOne(Address, {
        where: [{ is_favorite: true, user_id: user.id }],
      });
      if (!address) {
        throw new BadRequestException(
          'message.user_does_not_have_a_default_address',
        );
      }
      const cart = await context.findOne(Cart, { where: { user_id: user.id } });

      const cart_products = await context.find(CartProduct, {
        where: { cart_id: cart.id, section_id: req.section_id },
        relations: {
          product_category_price: {
            product_additional_services: { additional_service: true },

            product_measurement: { measurement_unit: true },

            product_offer: true,
            product_sub_category: {
              product: { product_images: true, warehouses_products: true },
              category_subCategory: { section_category: true },
            },
          },
        },
      });
      if (cart_products.length == 0) {
        throw new BadRequestException('message.cart_is_empty');
      }
      const payment_method = await context.findOne(PaymentMethod, {
        where: {
          id: req.payment_method.payment_method_id,
          is_active: true,
        },
      });
      if (!payment_method) {
        throw new BadRequestException('message.payment_method_not_found');
      }
      const date =
        req.delivery_type == DeliveryType.SCHEDULED
          ? new Date(req.slot_day?.day)
          : new Date();
      // date.setHours(date.getHours() + 3);
      const isoDate = date.toISOString().slice(0, 10);
      const count = await context
        .createQueryBuilder(Order, 'order')
        .where('order.delivery_day = :specificDate', { specificDate: isoDate })
        .getCount();

        const order_id=uuidv4();
      const order = await context.save(Order, {
        ...plainToInstance(Order, req),
        id: order_id,
        user_id: user.id,
        warehouse_id: cart_products[0].warehouse_id,
        delivery_fee: section.delivery_price,
        platform: req.platform,
        number: generateOrderNumber(count, isoDate),
        address_id: address.id,
        is_paid: payment_method.type != PaymentMethodEnum.CASH ? true : false,
        payment_method: payment_method.type,
        payment_method_id: req.payment_method.payment_method_id,
        transaction_number:
          payment_method.type == PaymentMethodEnum.JAWALI
            ? req.payment_method.transaction_number
            : null,
      });

      switch (req.delivery_type) {
        case DeliveryType.FAST:
          {
            // Add 40 minutes
            date.setMinutes(date.getMinutes() + 40);
            order.delivery_day = isoDate;
            order.estimated_delivery_time = date;
          }
          break;
        case DeliveryType.SCHEDULED:
          {
            order.delivery_day = req.slot_day.day;
            order.slot_id = req.slot_day.slot_id;
            const slot = await context.findOne(Slot, {
              where: { id: req.slot_day.slot_id },
            });
            order.estimated_delivery_time = new Date(
              req.slot_day.day + 'T' + slot.start_time + 'Z',
            );
            order.estimated_delivery_time.setHours(
              order.estimated_delivery_time.getHours() - 3,
            );
            if (order.estimated_delivery_time < new Date())
              throw new BadRequestException('هذا الوقت منتهي');
          }
          break;
        case DeliveryType.WAREHOUSE_PICKUP:
          {
            const currentDate = new Date();

            // Add 40 minutes
            currentDate.setMinutes(currentDate.getMinutes() + 20);

            order.delivery_day = isoDate;
            order.estimated_delivery_time = currentDate;
          }
          break;
      }

      const shipment = await context.save(Shipment, {
        order_id: order.id,
        warehouse_id: cart_products[0].warehouse_id,
      });

      const shipment_products = await Promise.all(
        cart_products.map(async (e) => {
          const is_offer =
            e.product_category_price.product_offer &&
            e.product_category_price.product_offer.offer_quantity > 0 &&
            e.product_category_price.product_offer.is_active &&
            e.product_category_price.product_offer.start_date < new Date() &&
            new Date() < e.product_category_price.product_offer.end_date &&
            e.quantity <= e.product_category_price.product_offer.offer_quantity;

          if (is_offer) {
            e.product_category_price.min_order_quantity =
              e.product_category_price.product_offer.min_offer_quantity;
            e.product_category_price.max_order_quantity =
              e.product_category_price.product_offer.max_offer_quantity;
            e.product_category_price.price =
              e.product_category_price.product_offer.price;
          }
          if (e.quantity < e.product_category_price.min_order_quantity) {
            e.quantity = e.product_category_price.min_order_quantity;
          }
          //handling offer
          if (is_offer == true) {
            const product_offer = await context.findOne(ProductOffer, {
              where: { product_category_price_id: e.product_category_price_id },
            });
            if (
              product_offer.offer_quantity - e.quantity < 0 ||
              product_offer.end_date < new Date()
            ) {
              throw new BadRequestException('offer is not available');
            }
            product_offer.offer_quantity =
              product_offer.offer_quantity - e.quantity;
            await context.save(product_offer);
          }

          return new ShipmentProduct({
            shipment_id: shipment.id,
            ...e,
            price:
              Number(e.product_category_price.price) +
              (e.additions?.length > 0
                ? Number(
                    e.product_category_price.product_additional_services.filter(
                      (j) => {
                        return e.additions?.includes(j.id);
                      },
                    )[0].price,
                  )
                : 0),
            created_at: new Date(),
          });
        }),
      );
      await context.save(shipment_products);
      order.products_price = shipment_products.reduce(
        (a, b) => a + b.price * b.quantity,
        0,
      );
      if (order.products_price < section.min_order_price) {
        throw new BadRequestException(
          'message.total_price_is_less_than_min_order_price',
        );
      }

      let total = Number(order.products_price);
      const devliery_fee =
        order.delivery_type == DeliveryType.WAREHOUSE_PICKUP
          ? 0
          : Number(order.delivery_fee);
      order.delivery_fee = devliery_fee;
      total += devliery_fee;

      order.total_price = total;
      if (req.promo_code) {
        const promo_code = await this.promoCodeService.getValidPromoCodeByCode(
          req.promo_code,
          req.payment_method.payment_method_id,
        );
        if (promo_code) {
          order.promo_code_id = promo_code.id;
          total -= promo_code.discount;
          order.total_price = total;
          order.promo_code = promo_code;
          order.promo_code_discount = promo_code.discount;
          promo_code.current_uses++;
          if (promo_code.user_ids == null) promo_code.user_ids = [];
          promo_code.user_ids.push(user.id);
          await context.save(promo_code);
        }
      }
      await context.save(Order, order);

      switch (payment_method.type) {
        case PaymentMethodEnum.JAWALI: {
          const make_payment = await this.paymentService.jawalicashOut(
            req.payment_method.transaction_number,
            req.payment_method.wallet_number,
            total,
          );
          if (!make_payment) {
            throw new BadRequestException('message.payment_failed');
          }
          try{
          await this.transactionService.makeTransaction(
            new MakeTransactionRequest({
              amount: order.total_price,
              type: TransactionTypes.ORDER_PAYMENT,
              order_id: order_id,
              wallet_type: 'JAWALI',
            }),
          );}catch(e){}
          break;
        }
        case PaymentMethodEnum.WALLET: {
          const wallet = await context.findOneBy(Wallet, { user_id: user.id });

          wallet.balance = Number(wallet.balance) - Number(total);
          if (wallet.balance < 0) {
            throw new BadRequestException('message.insufficient_balance');
          }
          const transaction = plainToInstance(Transaction, {
            amount: -total,
            user_id: user.id,
            order_id: order_id,
            type: TransactionTypes.ORDER_PAYMENT,
            wallet_id: wallet.id,
          });

          await context.save(transaction);

          await context.save(wallet);
          try {
            await this.transactionService.makeTransaction(
              new MakeTransactionRequest({
                amount: order.total_price,
                type: TransactionTypes.ORDER_PAYMENT,
                order_id: order_id,
                wallet_type: 'BARQ_WALLET',
              }),
            );
          } catch (e) {console.log(e);}
          break;
        }
        case PaymentMethodEnum.KURAIMI: {
          const make_payment = await this.paymentService.kuraimiPay({
            AMOUNT: total,
            REFNO: order.id,
            SCustID: encodeUUID(order.user_id),
            PINPASS: req.payment_method.transaction_number,
          });
          if (make_payment['Code'] != 1) {
            throw new BadRequestException(
              this.request.headers['accept-language'] == 'en'
                ? make_payment['Message']
                : make_payment['MessageDesc'],
            );
          }
          try {
            await this.transactionService.makeTransaction(
              new MakeTransactionRequest({
                amount: order.total_price,
                type: TransactionTypes.ORDER_PAYMENT,
                order_id: order_id,
                wallet_type: 'KURAIMI',
              }),
            );
          } catch (e) {}
          break;
        }
        case PaymentMethodEnum.JAIB: {
          await this.paymentService.jaibCashout(
            req.payment_method.transaction_number,
            req.payment_method.wallet_number,
            total,
            order.number.toString(),
          );
          try {
            await this.transactionService.makeTransaction(
              new MakeTransactionRequest({
                amount: order.total_price,
                type: TransactionTypes.ORDER_PAYMENT,
                order_id: order_id,
                wallet_type: 'JAIB',
              }),
            );
          } catch (e) {}
          break;
        }
        default:
          break;
      }

      // if (payment_method.type == PaymentMethodEnum.JAWALI) {
      //   const make_payment = await this.paymentService.jawalicashOut(
      //     req.payment_method.transaction_number,
      //     req.payment_method.wallet_number,
      //     total,
      //   );
      //   if (!make_payment) {
      //     throw new BadRequestException('payment failed');
      //   }
      // }
      //  else if (payment_method.type == PaymentMethodEnum.WALLET) {
      //   const wallet = await context.findOneBy(Wallet, { user_id: user.id });

      //   wallet.balance = Number(wallet.balance) - Number(total);
      //   if (wallet.balance < 0) {
      //     throw new BadRequestException('message.insufficient_balance');
      //   }
      //   const transaction = plainToInstance(Transaction, {
      //     amount: -total,
      //     user_id: user.id,
      //     type: TransactionTypes.ORDER_PAYMENT,
      //     wallet_id: wallet.id,
      //   });

      //   await context.save(transaction);

      //   await context.save(wallet);
      // }
      // else if (payment_method.type == PaymentMethodEnum.KURAIMI) {
      //   const make_payment = await this.paymentService.kuraimiPay({
      //     AMOUNT: total,
      //     REFNO: order.id,
      //     SCustID: encodeUUID(order.user_id),
      //     PINPASS: req.payment_method.transaction_number,
      //   });
      //   if (make_payment['Code'] != 1) {
      //     throw new BadRequestException(
      //       this.request.headers['accept-language'] == 'en'
      //         ? make_payment['Message']
      //         : make_payment['MessageDesc'],
      //     );
      //   }
      // }

      await context.delete(CartProduct, cart_products);

      //warehouse opreation
      const warehouse_operations = await context.save(
        WarehouseOperations,
        new WarehouseOperations({
          type: operationType.SELL,
          user_id: user.id,
          warehouse_id: cart_products[0].warehouse_id,
        }),
      );
      for (let index = 0; index < shipment_products.length; index++) {
        const warehouse_product = await context.findOne(WarehouseProducts, {
          where: {
            warehouse_id: cart_products[0].warehouse_id,
            product_id: shipment_products[index].product_id,
          },
        });
        if (!warehouse_product) {
          throw new BadRequestException(
            'message.warehouse_product_not_enough' + index,
          );
        }
        warehouse_product.quantity =
          warehouse_product.quantity -
          shipment_products[index].quantity *
            shipment_products[index].conversion_factor;
        if (warehouse_product.quantity < 0) {
          throw new BadRequestException(
            'message.warehouse_product_not_enough' + index,
          );
        }
        await context.save(warehouse_product);
        await context.save(
          WarehouseOpreationProducts,
          new WarehouseOpreationProducts({
            product_id: shipment_products[index].product_id,
            operation_id: warehouse_operations.id,

            product_measurement_id:
              shipment_products[index].main_measurement_id,
            quantity:
              -shipment_products[index].quantity *
              shipment_products[index].conversion_factor,
          }),
        );
      }

      let to_rooms = ['admin'];
      if (order.delivery_type == DeliveryType.FAST)
        to_rooms.push(shipment.warehouse_id);

      const warehouse = await context.findOne(Warehouse, {
        where: { id: shipment.warehouse_id },
      });
      order.address = address;

      await this.orderGateway.notifyOrderStatusChange({
        action: ShipmentStatusEnum.PENDING,
        to_rooms,
        body: {
          shipment: shipment,
          order: order,
          warehouse,
          client: user,
          driver: null,
        },
      });
      const driversWarehouse = await context.find(Driver, {
        where: {
          warehouse_id: shipment.warehouse_id,
        },
        relations: { user: true },
      });

      if (order.delivery_type == DeliveryType.FAST) {
        for (let index = 0; index < driversWarehouse.length; index++) {
          if (driversWarehouse[index].user?.fcm_token != null)
            await this.notificationService.create(
              new NotificationEntity({
                user_id: driversWarehouse[index].user_id,
                url: shipment.id,
                type: NotificationTypes.ORDERS,
                title_ar: 'طلب جديد',
                title_en: 'new order',
                text_ar: 'هل تريد اخذ هذا الطلب ؟',
                text_en: 'Do you want to take this order?',
              }),
            );
        }
      }

      return order;
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error);
    }
  }
}
export function generateOrderNumber(count: number, order_day: string) {
  // number of digits matches ##-**-@@-&&&&, where ## is 100 - the year last 2 digits, ** is 100 - the month, @@ is 100 - the day, &&&& is the number of the order in that day
  const date = new Date(order_day);

  const year = date.getFullYear().toString().substr(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  // order number is the count of orders created today + 1 with 4 digits and leading zeros
  const orderNumber = (count + 1).toString().padStart(4, '0');
  return `${100 - parseInt(year)}${100 - parseInt(month)}${
    100 - parseInt(day)
  }${orderNumber}`;
}
