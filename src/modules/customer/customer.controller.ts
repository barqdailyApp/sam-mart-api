import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { Roles } from '../authentication/guards/roles.decorator';
import { RolesGuard } from '../authentication/guards/roles.guard';
import { CustomerResponse } from './dto/response/customer.response';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { CustomerFilterRequest } from './dto/request/customer-filter.request';
@ApiBearerAuth()
@ApiHeader({
  name: 'Accept-Language',
  required: false,
  description: 'Language header: en, ar',
})
@ApiTags('Customer')
@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('all-customers')
  async getAllBikers(@Query() customerFilterRequest: CustomerFilterRequest) {
    const all_customers = await this.customerService.getAllCustomers(
      customerFilterRequest,
    );
    const all_customers_dto = all_customers.map(
      (item) => new CustomerResponse(item),
    );
    return all_customers_dto;
  }
}
