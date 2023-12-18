import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from 'src/infrastructure/entities/customer/customer.entity';
import { Repository } from 'typeorm';
import { CustomerFilterRequest } from './dto/request/customer-filter.request';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private readonly customer_repo: Repository<Customer>,
  ) {}
  async getAllCustomers(customerFilterRequest: CustomerFilterRequest) {
    const { limit, page } = customerFilterRequest;
    const skip = (page - 1) * limit;
    return await this.customer_repo.find({
      skip,
      take: limit,
      relations: { user: true },
    });
  }
}
