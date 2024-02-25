import { Controller, Get, Query } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { PaginatedRequest } from 'src/core/base/requests/paginated.request';
import { PaginatedResponse } from 'src/core/base/responses/paginated.response';
import { ActionResponse } from 'src/core/base/responses/action.response';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get()
  async getTransactions(@Query() query: PaginatedRequest) {
    const transaction = await this.transactionService.findAll(query);

    if (query.page && query.limit) {
      const total = await this.transactionService.count(query);
      return new PaginatedResponse(transaction, { meta: { total, ...query } });
    } else {
      return new ActionResponse(transaction);
    }
  }

  @Get('wallet')
  async getWallet() {
    return new ActionResponse(await this.transactionService.getWallet());
  }
}
