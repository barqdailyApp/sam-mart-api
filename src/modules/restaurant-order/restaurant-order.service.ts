import { Inject, Injectable, Res } from '@nestjs/common';
import { MakeRestaurantOrderTransaction } from './util/make-restaureant-order.transaction';
import { MakeRestaurantOrderRequest } from './dto/request/make-restaurant-order.request';
import { InjectRepository } from '@nestjs/typeorm';
import { RestaurantOrder } from 'src/infrastructure/entities/restaurant/order/restaurant_order.entity';
import { In, Repository } from 'typeorm';
import { ShipmentStatusEnum } from 'src/infrastructure/data/enums/shipment_status.enum';
import { Driver } from 'src/infrastructure/entities/driver/driver.entity';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { DriverTypeEnum } from 'src/infrastructure/data/enums/driver-type.eum';
import { PaginatedRequest } from 'src/core/base/requests/paginated.request';
import { GetDriverRestaurantOrdersQuery } from './dto/query/get-driver-restaurant-order.query';
import { OrderGateway } from 'src/integration/gateways/order.gateway';
import { NotificationService } from '../notification/notification.service';
import { NotificationTypes } from 'src/infrastructure/data/enums/notification-types.enum';
import { NotificationEntity } from 'src/infrastructure/entities/notification/notification.entity';
import { BaseService } from 'src/core/base/service/service.base';
import { I18nResponse } from 'src/core/helpers/i18n.helper';
@Injectable()
export class RestaurantOrderService extends BaseService<RestaurantOrder> {
    constructor(
      @InjectRepository(RestaurantOrder) private readonly restaurantOrderRepository:Repository<RestaurantOrder>,
      private readonly makeRestaurantOrderTransaction: MakeRestaurantOrderTransaction,
     
        @InjectRepository(Driver) private readonly driverRepository:Repository<Driver>,
        @Inject(REQUEST) private readonly _request: Request,
         private readonly orderGateway: OrderGateway,
            private readonly notificationService: NotificationService,
            @Inject(I18nResponse) private readonly _i18nResponse: I18nResponse
    ) {super(restaurantOrderRepository)}

    async makeRestaurantOrder(req: MakeRestaurantOrderRequest) {
        return await this.makeRestaurantOrderTransaction.run(req);
    }

    
    async getRestaurantOrdersDriverRequests(query:PaginatedRequest){
        // if limit and page are null put default values
        if (!query.limit) query.limit = 10;
        if (!query.page) query.page = 1;
        const driver = await this.driverRepository.findOne({
            where: {
                user_id: this._request.user.id,
                is_receive_orders:true,
                type:DriverTypeEnum.FOOD
            }

        })
        const orders=await this.restaurantOrderRepository.findAndCount({
            where: {
                driver_id: null,
                status: ShipmentStatusEnum.CONFIRMED,
                restaurant:{
                    city_id:driver.city_id
                }
            },
            take:query.limit*1  ,withDeleted:true,
            skip:query.page - 1,
            relations:{user:true,restaurant:true,address:true,payment_method:true,}
        })
     
        return {orders:orders[0],total:orders[1]};
    }

    async driverAcceptOrder(id:string){
        const driver = await this.driverRepository.findOne({
            where: {
                user_id: this._request.user.id,
                is_receive_orders:true,
                type:DriverTypeEnum.FOOD
            }
        }
        )
        const order=await this.restaurantOrderRepository.findOne({
            where:{id,driver_id:null},withDeleted:true,
            relations:{user:true,restaurant:true,address:true,}
        })
        if(!order) throw new Error('message.order_not_found')
        order.driver_id=driver.id;
      if(order.status!=ShipmentStatusEnum.CONFIRMED) throw new Error('message.order_is_not_confirmed')
        
        //send notification to driver and emit event
        const drivers=await this.driverRepository.find({
            where: {
                user_id: this._request.user.id,
                is_receive_orders:true,
                type:DriverTypeEnum.FOOD
            },
            relations:{user:true}
        })
        try{
          await this.orderGateway.emitRestauarntOrderEvent({...order,driver:driver},drivers.map(driver=>driver.id))
      
          }catch(e){
            
          }
      
      order.status=ShipmentStatusEnum.ACCEPTED
        await this.restaurantOrderRepository.save(order)
        return order
    }

    async getRestaurantOrdersDriverOrders(query:GetDriverRestaurantOrdersQuery){
        // if limit and page are null put default values
        
        if (!query.limit) query.limit = 10;
        if (!query.page) query.page = 1;

        const driver = await this.driverRepository.findOne({
            where: {
                user_id: this._request.user.id,
                is_receive_orders:true,
                type:DriverTypeEnum.FOOD
            }
        })
      
        const orders=await this.restaurantOrderRepository.findAndCount({
            where: {
                driver_id: driver.id,
                status: query?.status==ShipmentStatusEnum.ACTIVE ? In([ShipmentStatusEnum.ACCEPTED,ShipmentStatusEnum.READY_FOR_PICKUP,ShipmentStatusEnum.PICKED_UP, ShipmentStatusEnum.PROCESSING]) : query.status,
            },
            take:query.limit*1  ,
            skip:query.page - 1,withDeleted:true,
            relations:{user:true,restaurant:true,address:true,}
        })
        return {orders:orders[0],total:orders[1]};
    }

     async getTotalDriverOrders() {
        const user = this._request.user;
        const driver = await this.driverRepository.findOne({
          where: {
            user_id: user.id,
          },
        });
        const ordersNew = await this.restaurantOrderRepository.count({
          where: {
            status: ShipmentStatusEnum.CONFIRMED,
            
          
              restaurant:{city_id:driver.city_id}
           
            
          },
       
       
        });
        const ordersActive = await this.restaurantOrderRepository.count({
          where: {
            status: In([
              ShipmentStatusEnum.ACCEPTED,
              ShipmentStatusEnum.PROCESSING,
              ShipmentStatusEnum.PICKED_UP,
              ShipmentStatusEnum.READY_FOR_PICKUP,
            ]),
            driver_id: driver.id,

          },
        
        });
    
        const ordersDelivered = await this.restaurantOrderRepository.count({
          where: {
            status: ShipmentStatusEnum.DELIVERED,
            driver_id: driver.id,
            
          },
         
        });
    
        
    
        return {
          ordersNew,
          ordersActive,
          ordersDelivered,
          
        };
      }

      async confirmOrder(id:string){
        const order=await this.restaurantOrderRepository.findOne({
            where:{id},withDeleted:true,
            relations:{user:true,restaurant:true,address:true,payment_method:true,driver:true}
        })
        if(!order) throw new Error('message.order_not_found')   
        order.status=ShipmentStatusEnum.CONFIRMED
        await this.restaurantOrderRepository.save(order)
const drivers=await this.driverRepository.find({
    where: {
        city_id:order.restaurant.city_id,
        is_receive_orders:true,
        type:DriverTypeEnum.FOOD
    },relations:{user:true}
})
const restult=this._i18nResponse.entity(order);
        try{
        await this.orderGateway.emitRestauarntOrderEvent(restult,drivers.map(driver=>driver.id))
            for (let index = 0; index < drivers.length; index++) {
                   if (drivers[index].user?.fcm_token != null)
                     await this.notificationService.create(
                       new NotificationEntity({
                         user_id: drivers[index].user_id,
                         url: order.id,
                         type: NotificationTypes.ORDERS,
                         title_ar: 'طلب جديد',
                         title_en: 'new order',
                         text_ar: 'هل تريد اخذ هذا الطلب ؟',
                         text_en: 'Do you want to take t`his order?',
                       }),
                     );
                 }

        }catch(e){
          
        }
        return order
        }

        async orderProcessing(id:string){
            const order=await this.restaurantOrderRepository.findOne({
                where:{id},withDeleted:true,
                relations:{user:true,restaurant:true,address:true,payment_method:true,driver:{user:true}}
            })
            if(!order) throw new Error('message.order_not_found')   
            if(order.status!=ShipmentStatusEnum.ACCEPTED) throw new Error('message.order_is_not_confirmed')
            order.status=ShipmentStatusEnum.PROCESSING
            await this.restaurantOrderRepository.save(order)
            //send notification to driver and emit event
           try{ 
            this.orderGateway.emitRestauarntOrderEvent(order,[order.driver_id ] )
            await this.notificationService.create(
              new NotificationEntity({
                user_id: order.driver.user_id,
                url: order.id,
                type: NotificationTypes.ORDERS,
                title_ar: 'جارى تحضير الطلب',
                title_en: 'Preparing order',
                text_ar: 'جارى تحضير الطلب',
                text_en: 'Preparing order',
              })
            )

           }catch(e){
           } 
            return order
        }

        async readyForPickup(id:string){
            const order=await this.restaurantOrderRepository.findOne({
                where:{id},withDeleted:true,
                relations:{user:true,restaurant:true,address:true,payment_method:true,driver:{user:true}}
            })
            if(!order) throw new Error('message.order_not_found')   
            if(order.status!=ShipmentStatusEnum.PROCESSING) throw new Error('message.order_is_not_processing')
            order.status=ShipmentStatusEnum.READY_FOR_PICKUP
            await this.restaurantOrderRepository.save(order)
            //send notification to driver and emit event
           try{
            this.orderGateway.emitRestauarntOrderEvent(order,[order.driver_id ] )
await this.notificationService.create(
  new NotificationEntity({
    user_id: order.driver.user_id,
    url: order.id,
    type: NotificationTypes.ORDERS,
    title_ar:"الطلب جاهز للتوصيل",
    title_en: 'Order ready for delivery',
    text_ar: 'الطلب جاهز للتوصيل',
    text_en: 'Order ready for delivery',
  })
)

           }catch(e){
           } 


            return order
            }

            async pickupOrder(id:string){
                const order=await this.restaurantOrderRepository.findOne({
                    where:{id},withDeleted:true,
                    relations:{user:true,restaurant:true,address:true,payment_method:true,driver:{user:true}}
                })
                if(!order) throw new Error('message.order_not_found')   
                  if(order.status!=ShipmentStatusEnum.READY_FOR_PICKUP) throw new Error('message.order_is_not_ready_for_pickup')
                order.status=ShipmentStatusEnum.PICKED_UP
                await this.restaurantOrderRepository.save(order)
                //send notification to driver and emit event
               try{
                this.orderGateway.emitRestauarntOrderEvent(order,[order.user_id ] )
                await this.notificationService.create(
                  new NotificationEntity({
                    user_id: order.user_id,
                    url: order.id,
                    type: NotificationTypes.ORDERS,
                    title_ar:"الطلب قيد التوصيل",
                    title_en: 'Order in delivery',
                    text_ar: 'الطلب قيد التوصيل',
                    text_en: 'Order in delivery',
                  })
                )
    
               }catch(e){
               } 
                return order
                }

                async deliverOrder(id:string){
                    const order=await this.restaurantOrderRepository.findOne({
                        where:{id},withDeleted:true,
                        relations:{user:true,restaurant:true,address:true,payment_method:true,driver:{user:true}}
                    })
                    if(!order) throw new Error('message.order_not_found') 
                      if(order.status!=ShipmentStatusEnum.PICKED_UP) throw new Error('message.order_is_not_picked_up')  
                    order.status=ShipmentStatusEnum.DELIVERED
                    await this.restaurantOrderRepository.save(order)
                    //send notification to driver and emit event
                    try{
                     this.orderGateway.emitRestauarntOrderEvent(order,[order.user_id ] )
                     await this.notificationService.create(
                       new NotificationEntity({
                         user_id: order.user_id,
                         url: order.id,
                         type: NotificationTypes.ORDERS,
                         title_ar:"الطلب تم التوصيل",
                         title_en: 'Order delivered',
                         text_ar: 'الطلب تم التوصيل',
                         text_en: 'Order delivered',
                       })
                     )
    
                    }catch(e){
                      console.log(e)
                    }
                     return order
                 
               }
            


        async getRestaurantOrderDetails(id:string){
            const order=await this.restaurantOrderRepository.findOne({
                where:{id},withDeleted:true,
                relations:{user:true,payment_method:true,restaurant:true,address:true,restaurant_order_meals:{meal:true,restaurant_order_meal_options:{option:{option_group:true}}}}
            })
            if(!order) throw new Error('message.order_not_found')
            return order
  } 

  async assignDriverToOrder(id:string,driver_id:string){
    const order=await this.restaurantOrderRepository.findOne({
        where:{id},withDeleted:true,
        relations:{user:true,payment_method:true,restaurant:true,address:true,driver:true}
    })
    if(!order) throw new Error('message.order_not_found')
      const driver=await this.driverRepository.findOne({
        where:{id,city_id:order.restaurant.city_id,is_receive_orders:true,type:DriverTypeEnum.FOOD},
        relations:{user:true}
    })
    if(!driver) throw new Error('message.driver_not_found')
    order.driver_id=driver_id
    await this.restaurantOrderRepository.save(order)
    return order
  }

}
