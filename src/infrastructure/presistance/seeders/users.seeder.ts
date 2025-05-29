import { Injectable } from '@nestjs/common';
import { Seeder, DataFactory } from 'nestjs-seeder';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/infrastructure/entities/user/user.entity';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { Gender } from 'src/infrastructure/data/enums/gender.enum';

import { ShipmentStatusEnum } from 'src/infrastructure/data/enums/shipment_status.enum';
import { Order } from 'src/infrastructure/entities/order/order.entity';
import { RestaurantOrder } from 'src/infrastructure/entities/restaurant/order/restaurant_order.entity';

@Injectable()
export class UsersSeeder implements Seeder {
  constructor(
    @InjectRepository(User) private readonly user: Repository<User>,
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(RestaurantOrder)
    private readonly restaurantOrderRepo: Repository<RestaurantOrder>,
    private readonly configService: ConfigService,
  ) {}

  async seed(): Promise<any> {
    // Generate 10 users.
    const users = await this.user.find({ where: { roles: Role.CLIENT } });
    for (let index = 0; index < users.length; index++) {
      const barq_order_count = await this.orderRepo.count({
        where: {
          user_id: users[index].id,
          shipments: { status: ShipmentStatusEnum.DELIVERED },
        },
      });
      const restaurant_order = await this.restaurantOrderRepo.count({
        where: {
          user_id: users[index].id,
          status: ShipmentStatusEnum.DELIVERED,
        },
      });

      const total = barq_order_count + restaurant_order;
      users[index].orders_completed = total;
    }
    // Insert into the database with relations.
    return this.user.save(users);

    // create customer
  }

  async drop(): Promise<any> {
    return;
  }
}
