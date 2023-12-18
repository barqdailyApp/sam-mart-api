import { Injectable } from '@nestjs/common';
import { Seeder } from 'nestjs-seeder';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/infrastructure/entities/user/user.entity';

import { Customer } from 'src/infrastructure/entities/customer/customer.entity';

import { Role } from 'src/infrastructure/data/enums/role.enum';

@Injectable()
export class CustomerSeeder implements Seeder {
  constructor(
    @InjectRepository(User) private readonly user: Repository<User>,
    @InjectRepository(Customer) private readonly customer: Repository<Customer>
  ) { }

  async seed(): Promise<any> {
    // Get users.
    const users = await this.user.createQueryBuilder('users')
      .select(['users.id', 'users.roles'])
      .where('users.roles = "CLIENT"')
      .getMany();


    // add customer to users
const  customers=  users.map((user) => {
     
      return new Customer({user_id:user.id});
     
      }
    );

    // Insert into the database with relations.
    return this.customer.save(customers);
  }

  async drop(): Promise<any> {
    return this.customer.delete({});
  }
}
