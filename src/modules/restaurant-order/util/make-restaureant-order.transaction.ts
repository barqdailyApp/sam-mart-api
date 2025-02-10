import { Restaurant } from "src/infrastructure/entities/restaurant/restaurant.entity";
import { MakeRestaurantOrderRequest } from "../dto/request/make-restaurant-order.request";
import { RestaurantOrder } from "src/infrastructure/entities/restaurant/order/restaurant_order.entity";
import { Injectable, Inject, BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { REQUEST } from "@nestjs/core";
import { BaseTransaction } from "src/core/base/database/base.transaction";
import { FileService } from "src/modules/file/file.service";
import { DataSource, EntityManager, Transaction } from "typeorm";
import { plainToInstance } from "class-transformer";
import { RestaurantCartMeal } from "src/infrastructure/entities/restaurant/cart/restaurant-cart-meal.entity";
import { Request } from "express";
import { RestaurantOrderMeal } from "src/infrastructure/entities/restaurant/order/restaurant_order_meal.entity";
import { generateOrderNumber } from "src/modules/order/util/make-order.transaction";
import { DeliveryType } from "src/infrastructure/data/enums/delivery-type.enum";
import { Address } from "src/infrastructure/entities/user/address.entity";
import { PaymentMethodEnum } from "src/infrastructure/data/enums/payment-method";
import { encodeUUID } from "src/core/helpers/cast.helper";
import { TransactionTypes } from "src/infrastructure/data/enums/transaction-types";
import { Wallet } from "src/infrastructure/entities/wallet/wallet.entity";
import { PaymentMethodService } from "src/modules/payment_method/payment_method.service";
import { PaymentMethod } from "src/infrastructure/entities/payment_method/payment_method.entity";
import { or } from "sequelize";
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
    private readonly paymentService: PaymentMethodService
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
        const address=await context.findOneBy(Address,{user_id:this.request.user.id,is_favorite:true})
        if(!address) throw new BadRequestException('message.user_does_not_have_a_default_address')
        const order = plainToInstance(RestaurantOrder, req);
        order.address_id=address.id
        order.user_id = this.request.user.id;
        order.payment_method_id=req.payment_method.payment_method_id
      
        const date = new Date();
  const isoDate = date.toISOString().slice(0, 10);
  const count = await context
  .createQueryBuilder(RestaurantOrder, 'restaurant_order')
  .where('DATE(restaurant_order.created_at) = :specificDate', { specificDate: isoDate })
  .getCount();
order.estimated_delivery_time = date; 
order.number= generateOrderNumber(count,isoDate)




// handle cart
        const cart_meals = await context.find(RestaurantCartMeal, {
            where:{
                cart:{
                    user_id: this.request.user.id
                },
            },
            relations:{meal:true,cart_meal_options:{option:true},cart:true}
        })
      
        if(cart_meals?.length == 0){
            throw new BadRequestException('message.cart_empty')}
            order.restaurant_id=cart_meals[0].cart.restaurant_id
            // tranfer cart_meals to order_meals
            const restaurant_order_meals= cart_meals.map(cart_meal=>{
                return plainToInstance(RestaurantOrderMeal,{
                    meal_id: cart_meal.meal_id,
                    order_id:order.id,
                    quantity: cart_meal.quantity,
                    price: cart_meal.meal.price,
                    total_price: Number(cart_meal.meal.price)+Number(cart_meal.cart_meal_options.map(cart_meal_option=>cart_meal_option.option.price).reduce((a,b)=>a+b,0)),
                    restaurant_order_meal_options:cart_meal.cart_meal_options.map(cart_meal_option=>{return {option_id:cart_meal_option.option_id,price:cart_meal_option.option.price}})
                }
            )  
            })
            await context.save(restaurant_order_meals)
            await context.remove(cart_meals)
         
       

// handle payment
let total= order.restaurant_order_meals.map(order_meal=>order_meal.total_price).reduce((a,b)=>a+b,0)

const devliery_fee =0;
order.delivery_fee = devliery_fee;
total += devliery_fee;
order.total_price=total;


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
            order_id: order.id,
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

        return await context.save(order);
     
      } catch (error) {
        throw new BadRequestException(error.message);
      }
    }
    
  }

