import {
  Controller,
  ForbiddenException,
  Get,
  Inject,
  Post,
  Query,
} from '@nestjs/common';
import { PaymentMethodService } from './payment_method.service';
import { PaginatedRequest } from 'src/core/base/requests/paginated.request';
import { ActionResponse } from 'src/core/base/responses/action.response';
import { toUrl } from 'src/core/helpers/file.helper';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { I18nResponse } from 'src/core/helpers/i18n.helper';
import { KuraimiUserCheckRequest } from './dto/requests/kuraimi-user-check';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/infrastructure/entities/user/user.entity';
import { Repository } from 'typeorm';
import { Request } from 'express';

import { KuraimiUserResponse } from './dto/response/kuraimi-user-response';
import { encodeUUID } from 'src/core/helpers/cast.helper';
import { REQUEST } from '@nestjs/core';
@ApiHeader({
  name: 'Accept-Language',
  required: false,
  description: 'Language header: en, ar',
})
@ApiTags('Payment Method')
@Controller('payment-method')
export class PaymentMethodController {
  constructor(
    private readonly paymentService: PaymentMethodService,
    @InjectRepository(User) private readonly user_repo: Repository<User>,
    @Inject(I18nResponse) private readonly _i18nResponse: I18nResponse,
    @Inject(REQUEST) private request: Request,
  ) {}

  @Get()
  async getPaymentMethods(@Query() query: PaginatedRequest) {
    return new ActionResponse(
      this._i18nResponse.entity(
        (await this.paymentService.findAll(query)).map((payment) => {
          payment.logo = toUrl(payment.logo);
          return payment;
        }),
      ),
    );
  }

  @Get('kuraimi/check-user')
  async checkUser(@Query() req: KuraimiUserCheckRequest) {
  
    if (
      this.request.headers.authorization != 'Basic a3VyYWltaV9wYXk6Z14jM3ZQN0A='
    )
      return new ForbiddenException('Not Allowed');
    const user = await this.paymentService.checkUser(req);
    if (user) {
      return new KuraimiUserResponse({
        Code: '1',
        SCustID: encodeUUID(user.id),
        DescriptionAr: 'تم التحقق من تفاصيل العملية بنجاح',
        DescriptionEn: 'Customer details verified successfully ',
      });
    } else
      return new KuraimiUserResponse({
        Code: '2',
        SCustID: null,
        DescriptionAr: 'تفاصيل العملية غير صالحة',
        DescriptionEn: 'Invalid customer details',
      });
  }
  @Post('cash-out')
  async cashOut() {
    // return await this.paymentService.jawalicashOut("10020","777687613");
  }
}
