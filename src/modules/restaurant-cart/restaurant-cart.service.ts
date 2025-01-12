import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RestaurantCart } from 'src/infrastructure/entities/restaurant/restaurant-cart.entity';
import { In, Repository } from 'typeorm';
import { AddMealRestaurantCartTransaction } from './util/add-meal-restaurant-cart.transaction';
import { AddMealRestaurantCartRequest } from './dto/request/add-meal-restaurant-cart.request';

@Injectable()
export class RestaurantCartService {
constructor(private readonly addMealTransaction: AddMealRestaurantCartTransaction) {}

    async addMealToCart(req: AddMealRestaurantCartRequest) {
        return await this.addMealTransaction.run(req);
    }
}
