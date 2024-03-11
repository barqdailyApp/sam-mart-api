import { Controller, Get, Inject, Query } from '@nestjs/common';
import { PaymentMethodService } from './payment_method.service';
import { PaginatedRequest } from 'src/core/base/requests/paginated.request';
import { ActionResponse } from 'src/core/base/responses/action.response';
import { toUrl } from 'src/core/helpers/file.helper';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { I18nResponse } from 'src/core/helpers/i18n.helper';
@ApiHeader({
    name: 'Accept-Language',
    required: false,
    description: 'Language header: en, ar',
  })
@ApiTags('Payment Method')
@Controller('payment-method')
export class PaymentMethodController {
  constructor(private readonly paymentService: PaymentMethodService,
    @Inject(I18nResponse) private readonly _i18nResponse: I18nResponse,) {}

  @Get()
  async getPaymentMethods(@Query() query: PaginatedRequest) {
    return new ActionResponse(
        this._i18nResponse.entity(
            
        
      (await this.paymentService.findAll(query)).map((payment) => {
        payment.logo = toUrl(payment.logo);
        return payment;
      })),
    );
  }
}
