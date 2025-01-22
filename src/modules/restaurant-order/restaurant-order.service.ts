import { Injectable } from '@nestjs/common';
import { MakeRestaurantOrderTransaction } from './util/make-restaureant-order.transaction';
import { MakeRestaurantOrderRequest } from './dto/request/make-restaurant-order.request';

@Injectable()
export class RestaurantOrderService {
    constructor(private readonly makeRestaurantOrderTransaction: MakeRestaurantOrderTransaction) {}

    async makeRestaurantOrder(req: MakeRestaurantOrderRequest) {
        return await this.makeRestaurantOrderTransaction.run(req);
    }
}
