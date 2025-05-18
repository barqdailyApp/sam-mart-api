import { Restaurant } from 'src/infrastructure/entities/restaurant/restaurant.entity';
import { MakeRestaurantOrderRequest } from '../dto/request/make-restaurant-order.request';
import { RestaurantOrder } from 'src/infrastructure/entities/restaurant/order/restaurant_order.entity';
import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { REQUEST } from '@nestjs/core';
import { BaseTransaction } from 'src/core/base/database/base.transaction';
import { FileService } from 'src/modules/file/file.service';
import { DataSource, EntityManager, Transaction } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { RestaurantCartMeal } from 'src/infrastructure/entities/restaurant/cart/restaurant-cart-meal.entity';
import { Request } from 'express';
import { RestaurantOrderMeal } from 'src/infrastructure/entities/restaurant/order/restaurant_order_meal.entity';
import { generateOrderNumber } from 'src/modules/order/util/make-order.transaction';
import { DeliveryType } from 'src/infrastructure/data/enums/delivery-type.enum';
import { Address } from 'src/infrastructure/entities/user/address.entity';
import { PaymentMethodEnum } from 'src/infrastructure/data/enums/payment-method';
import { encodeUUID } from 'src/core/helpers/cast.helper';
import { TransactionTypes } from 'src/infrastructure/data/enums/transaction-types';
import { Wallet } from 'src/infrastructure/entities/wallet/wallet.entity';
import { PaymentMethodService } from 'src/modules/payment_method/payment_method.service';
import { PaymentMethod } from 'src/infrastructure/entities/payment_method/payment_method.entity';
import { or } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import { Constant } from 'src/infrastructure/entities/constant/constant.entity';
import { ConstantType } from 'src/infrastructure/data/enums/constant-type.enum';
import { calculateDistances } from 'src/core/helpers/geom.helper';
import { de } from '@faker-js/faker';
import { DriverTypeEnum } from 'src/infrastructure/data/enums/driver-type.eum';
import { PromoCodeService } from 'src/modules/promo-code/promo-code.service';
import { OrderGateway } from 'src/integration/gateways/order.gateway';
import { RestaurantAdmin } from 'src/infrastructure/entities/restaurant/restaurant-admin.entity';
import { RestaurantService } from 'src/modules/restaurant/restaurant.service';
import { RestaurantStatus } from 'src/infrastructure/data/enums/restaurant-status.enum';
@Injectable()
export class MakeRestaurantOrderTransaction extends BaseTransaction<
  MakeRestaurantOrderRequest,
  RestaurantOrder
> {
  constructor(
    dataSource: DataSource,
    @Inject(REQUEST) readonly request: Request,
    private readonly fileService: FileService,
    @Inject(ConfigService) private readonly _config: ConfigService,
    private readonly paymentService: PaymentMethodService,
    private readonly promo_code_service: PromoCodeService,
    private readonly restaurantService: RestaurantService,
    private readonly orderGateway: OrderGateway,
  ) {
    super(dataSource);
  }

  // the important thing here is to use the manager that we've created in the base class
  protected async execute(
    req: MakeRestaurantOrderRequest,
    context: EntityManager,
  ): Promise<RestaurantOrder> {
    try {
      const user = this.request.user;
      const address = await context.findOneBy(Address, {
        user_id: this.request.user.id,
        is_favorite: true,
      });
      if (!address)
        throw new BadRequestException(
          'message.user_does_not_have_a_default_address',
        );
      const order = plainToInstance(RestaurantOrder, req);
      order.address_id = address.id;
      order.user_id = this.request.user.id;
      order.payment_method_id = req.payment_method.payment_method_id;
      const constants = await context.find(Constant);
      const fixed_delivery_distance = constants.find(
        (c) => c.type == ConstantType.FREE_DELIVERY_DISTANCE,
      )?.variable;
      const delivery_price_per_km = constants.find(
        (c) => c.type == ConstantType.DELIVERY_PRICE_PER_KM,
      )?.variable;
      const fixed_delivery_fee = constants.find(
        (c) => c.type == ConstantType.FIXED_DELIVERY_FEE,
      )?.variable;

      const delivery_time_per_km = constants.find(
        (c) => c.type == ConstantType.DELIVERY_TIME_PER_KM,
      )?.variable;

      const date = new Date();
      const isoDate = date.toISOString().slice(0, 10);
      const count = await context
        .createQueryBuilder(RestaurantOrder, 'restaurant_order')
        .where('DATE(restaurant_order.created_at) = :specificDate', {
          specificDate: isoDate,
        })
        .getCount();
      order.estimated_delivery_time = date;
      order.number = generateOrderNumber(count, isoDate);
      order.id = uuidv4();

      const payment_method = await context.findOne(PaymentMethod, {
        where: {
          id: req.payment_method.payment_method_id,
          is_active: true,
        },
      });
      if (!payment_method) {
        throw new BadRequestException('message.payment_method_not_found');
      }
      order.payment_method_enum = payment_method.type;
      order.payment_method = payment_method;
      await context.save(order);

      // handle cart
      const cart_meals = await context.find(RestaurantCartMeal, {
        where: {
          cart: {
            user_id: this.request.user.id,
          },
        },
        relations: {
          meal: { offer: true },
          cart_meal_options: { meal_option_price: true },
          cart: true,
        },
      });

      if (cart_meals?.length == 0) {
        throw new BadRequestException('message.cart_empty');
      }
      order.restaurant_id = cart_meals[0].cart.restaurant_id;
      const restaurant = await context.findOne(Restaurant, {
        where: {
          id: order.restaurant_id,
          status: RestaurantStatus.ACTIVE,
        },
        relations: { schedules: true },
      });
      if (!restaurant) {
        throw new BadRequestException('message.restaurant_not_found');
      }
      const is_system_active = this.restaurantService.IsRestaurantOpen(
        restaurant.id,
        restaurant.schedules,
      );

      if (!is_system_active) {
        throw new BadRequestException('restaurant is closed');
      }

      const distance = calculateDistances(
        [restaurant.latitude, restaurant.longitude],
        [address.latitude, address.longitude],
      );
      const delivery_time =
        Number(restaurant.average_prep_time || 0) +
        Number(distance) * Number(delivery_time_per_km || 0);
      order.estimated_delivery_time = new Date(
        new Date().getTime() + delivery_time * 60000,
      );
      const delivery_fee =
        Number(fixed_delivery_fee) +
        (Number(distance) - Number(fixed_delivery_distance) < 0
          ? 0
          : Number(distance) - Number(fixed_delivery_distance)) *
          Number(delivery_price_per_km);
      order.delivery_fee = delivery_fee;

      const restaurant_order_meals: RestaurantOrderMeal[] = [];

      for (const cart_meal of cart_meals) {
        if (!cart_meal.meal.is_active) {
          continue;
        }
        const offer = cart_meal.meal.offer;
        let discount_percentage = 0;
        let discounted_price = Number(cart_meal.meal.price);

        const currentTimeUTC3 = new Date(
          new Date().setUTCHours(new Date().getUTCHours() + 3),
        );

        if (
          offer &&
          offer.is_active &&
          new Date(offer.start_date) <= currentTimeUTC3 &&
          new Date(offer.end_date) > currentTimeUTC3
        ) {
          discount_percentage = Number(offer.discount_percentage);
          discounted_price =
            discounted_price - (discounted_price * discount_percentage) / 100;
        }

        const total_option_price =
          cart_meal?.cart_meal_options
            ?.map((opt) => opt?.meal_option_price?.price || 0)
            .reduce((a, b) => a + b, 0) || 0;

        const order_meal = plainToInstance(RestaurantOrderMeal, {
          meal_id: cart_meal.meal_id,
          order_id: order.id,
          quantity: cart_meal.quantity,
          restaurant_order_id: order.id,
          price: discounted_price,
          total_price: discounted_price + total_option_price,
          restaurant_order_meal_options: cart_meal?.cart_meal_options?.map(
            (opt) => ({
              option: opt?.meal_option_price?.option,
              price: opt?.meal_option_price?.price,
            }),
          ),
        });

        restaurant_order_meals.push(order_meal);
      }

      await context.save(restaurant_order_meals);

      await context.remove(cart_meals);
      let total = restaurant_order_meals
        .map((order_meal) => order_meal.total_price * order_meal.quantity)
        .reduce((a, b) => a + b, 0);

      order.sub_total = total;
      if (req?.wallet_discount > 0) {
        const wallet = await context.findOneBy(Wallet, { user_id: user.id });
        if (Number(wallet.balance) < req.wallet_discount) {
          throw new BadRequestException('message.insufficient_balance');
        }
        if (req?.wallet_discount > total) {
          req.wallet_discount = total;
        }
        total = total - req.wallet_discount;
      }
      total = total + delivery_fee;
      order.total_price = total;
      if (req.promo_code) {
        const promo_code =
          await this.promo_code_service.getValidPromoCodeByCode(
            req.promo_code,
            req.payment_method.payment_method_id,
          );
        if (promo_code && promo_code.type == DriverTypeEnum.FOOD) {
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
      // handle payment

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
            restaurant_order_id: order.id,
            type: TransactionTypes.ORDER_PAYMENT,
            wallet_id: wallet.id,
          });

          await context.save(transaction);

          await context.save(wallet);

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

          break;
        }
        case PaymentMethodEnum.JAIB: {
          await this.paymentService.jaibCashout(
            req.payment_method.transaction_number,
            req.payment_method.wallet_number,
            total,
            order.number.toString(),
          );

          break;
        }
        default:
          break;
      }

      await context.save(order);

      const admin_users = await context.find(RestaurantAdmin, {
        where: { restaurant_id: order.restaurant_id },
      });
      await this.orderGateway.emitRestauarntOrderEvent(order, [
        ...admin_users.map((admin) => admin.user_id),
        'admin',
      ]);
      return order;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
