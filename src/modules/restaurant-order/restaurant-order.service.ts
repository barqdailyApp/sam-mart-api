import { Inject, Injectable, Res } from '@nestjs/common';
import { MakeRestaurantOrderTransaction } from './util/make-restaureant-order.transaction';
import { MakeRestaurantOrderRequest } from './dto/request/make-restaurant-order.request';
import { InjectRepository } from '@nestjs/typeorm';
import { RestaurantOrder } from 'src/infrastructure/entities/restaurant/order/restaurant_order.entity';
import { Repository } from 'typeorm';
import { ShipmentStatusEnum } from 'src/infrastructure/data/enums/shipment_status.enum';
import { Driver } from 'src/infrastructure/entities/driver/driver.entity';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { DriverTypeEnum } from 'src/infrastructure/data/enums/driver-type.eum';
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

    async getRestaurantOrdersDriverRequests(){
        const driver = await this.driverRepository.findOne({
            where: {
                user_id: this._request.user.id,
                is_receive_orders:true,
                type:DriverTypeEnum.FOOD
            }

        })
        const orders=await this.restaurantOrderRepository.find({
            where: {
                driver_id: null,
                status: ShipmentStatusEnum.CONFIRMED,
                restaurant:{
                    city_id:driver.city_id
                }
            },
            relations:{user:true,restaurant:true,address:true,}
        })
        return orders;
    }
}
