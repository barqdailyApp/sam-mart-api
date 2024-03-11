import { Controller, Get, Query } from '@nestjs/common';
import { PaymentMethodService } from './payment_method.service';
import { PaginatedRequest } from 'src/core/base/requests/paginated.request';
import { ActionResponse } from 'src/core/base/responses/action.response';
import { toUrl } from 'src/core/helpers/file.helper';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Payment Method')
@Controller('payment-method')
export class PaymentMethodController {
  constructor(private readonly paymentService: PaymentMethodService) {}

  @Get()
  async getPaymentMethods(@Query() query: PaginatedRequest) {
    return new ActionResponse(
      (await this.paymentService.findAll(query)).map((payment) => {
        payment.logo = toUrl(payment.logo);
        return payment;
      }),
    );
  }
}
