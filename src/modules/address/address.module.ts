import { AddressService } from './address.service';
import { AddressController } from './address.controller';
import { Module } from '@nestjs/common';
import { SetFavoriteAddressTransaction } from './utils/transactions/set-favorite-address.transaction';
import { Restaurant } from 'src/infrastructure/entities/restaurant/restaurant.entity';
import { ProductClientService } from '../product/product-client.service';
import { RestaurantService } from '../restaurant/restaurant.service';
import { RestaurantModule } from '../restaurant/restaurant.module';
import { ProductModule } from '../product/product.module';

@Module({
    controllers: [
        AddressController
    ],
    providers: [
        AddressService,
        
        SetFavoriteAddressTransaction,
    ],
    imports:[
        RestaurantModule,ProductModule]
})
export class AddressModule { }
