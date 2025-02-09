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
@Injectable()
export class RestaurantOrderService {
    constructor(private readonly makeRestaurantOrderTransaction: MakeRestaurantOrderTransaction,
        @InjectRepository(RestaurantOrder) private readonly restaurantOrderRepository:Repository<RestaurantOrder>,
        @InjectRepository(Driver) private readonly driverRepository:Repository<Driver>,
        @Inject(REQUEST) private readonly _request: Request
    ) {}

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
            relations:{user:true,restaurant:true,address:true,}
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
        order.driver_id=driver.id,
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
                status: query.status,
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
            status: ShipmentStatusEnum.PENDING,
            
          
              restaurant:{city_id:driver.city_id}
           
            
          },
       
       
        });
        const ordersActive = await this.restaurantOrderRepository.count({
          where: {
            status: In([
              ShipmentStatusEnum.CONFIRMED,
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
}
