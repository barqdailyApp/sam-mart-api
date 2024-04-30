import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { PaginatedRequest } from 'src/core/base/requests/paginated.request';
import { PaginatedResponse } from 'src/core/base/responses/paginated.response';
import { ActionResponse } from 'src/core/base/responses/action.response';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { applyQueryFilters, applyQueryIncludes, applyQuerySort } from 'src/core/helpers/service-related.helper';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { RolesGuard } from '../authentication/guards/roles.guard';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { MakeTransactionRequest } from './dto/requests/make-transaction-request';
@ApiBearerAuth()
@ApiHeader({
  name: 'Accept-Language',
  required: false,
  description: 'Language header: en, ar',
})
@ApiTags('Transaction')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get()
  async getTransactions(@Query() query: PaginatedRequest) {
    applyQueryIncludes(query, 'order'); 
    applyQuerySort(query, 'created_at=desc');
    if(!this.transactionService.currentUser.roles .includes(Role.ADMIN)) 
    applyQueryFilters(query,`user_id=${this.transactionService.currentUser.id}`);
    const transaction = await this.transactionService.findAll(query);


    if (query.page && query.limit) {
      const total = await this.transactionService.count(query);
      return new PaginatedResponse(transaction, { meta: { total, ...query } });
    } else {
      return new ActionResponse(transaction);
    }
  }

  @Get('wallet')
  async getWallet(@Query("user_id") user_id:string ) {
    return new ActionResponse(await this.transactionService.getWallet(user_id));
  }

  @Post()
 async makeTransaction(@Body() request: MakeTransactionRequest) { 
    return new ActionResponse(await this.transactionService.makeTransaction(request));
    
  }


}
