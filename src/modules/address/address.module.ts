import { AddressService } from './address.service';
import { AddressController } from './address.controller';
import { Module } from '@nestjs/common';
import { SetFavoriteAddressTransaction } from './utils/transactions/set-favorite-address.transaction';
import { Restaurant } from 'src/infrastructure/entities/restaurant/restaurant.entity';
import { ProductClientService } from '../product/product-client.service';
import { RestaurantService } from '../restaurant/restaurant.service';
import { RestaurantModule } from '../restaurant/restaurant.module';
import { ProductModule } from '../product/product.module';
import { CartService } from '../cart/cart.service';
import { RestaurantCartService } from '../restaurant-cart/restaurant-cart.service';
import { AddMealRestaurantCartTransaction } from '../restaurant-cart/util/add-meal-restaurant-cart.transaction';
import { UpdateMealRestaurantCartTransaction } from '../restaurant-cart/util/update-meal-restaurant-cart.transaction';
import { TransactionModule } from '../transaction/transaction.module';

@Module({
  controllers: [AddressController],
  providers: [
    AddressService,

    SetFavoriteAddressTransaction,
    CartService,
    RestaurantCartService,
    AddMealRestaurantCartTransaction,
    UpdateMealRestaurantCartTransaction,
  ],
  imports: [RestaurantModule, ProductModule, TransactionModule],
  exports: [AddressModule],
})
export class AddressModule {}
