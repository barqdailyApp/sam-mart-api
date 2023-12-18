import { Injectable } from '@nestjs/common';
import { Seeder } from 'nestjs-seeder';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/infrastructure/entities/user/user.entity';

import { Customer } from 'src/infrastructure/entities/customer/customer.entity';

import { Role } from 'src/infrastructure/data/enums/role.enum';
import { Biker } from 'src/infrastructure/entities/biker/biker.entity';

@Injectable()
export class BikerSeeder implements Seeder {
  constructor(
    @InjectRepository(User) private readonly user: Repository<User>,
    @InjectRepository(Biker) private readonly biker: Repository<Biker>,
  ) {}

  async seed(): Promise<any> {
    // Get users.
    const users = await this.user
      .createQueryBuilder('users')
      .select(['users.id', 'users.roles'])
      .where('users.roles = "Biker"')
      .getMany();

    // add customer to users
    const biker = users.map((user) => {
      return new Biker({
        user_id: user.id,
        start_longitude:46.745423,
        start_latitude:24.616745,
        latitude: 24.616745,
        longitude: 46.745423,
      });
    });

    // Insert into the database with relations.
    return this.biker.save(biker);
  }

  async drop(): Promise<any> {
    return this.biker.delete({});
  }
}
