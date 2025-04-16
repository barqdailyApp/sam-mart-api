import { Module, Res } from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { RestaurantController } from './restaurant.controller';
import { RegisterRestaurantTransaction } from './util/register-restaurant.transaction';
import { AdminRestaurantController } from './admin-restaurant.controller';

@Module({
  providers: [RestaurantService,RegisterRestaurantTransaction],
  controllers: [RestaurantController,AdminRestaurantController],
  exports: [RestaurantModule,RestaurantService],
})
export class RestaurantModule {}
