import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  ForbiddenException,
  Get,
  Inject,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PaymentMethodService } from './payment_method.service';
import { PaginatedRequest } from 'src/core/base/requests/paginated.request';
import { ActionResponse } from 'src/core/base/responses/action.response';
import { toUrl } from 'src/core/helpers/file.helper';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiHeader,
  ApiTags,
} from '@nestjs/swagger';
import { I18nResponse } from 'src/core/helpers/i18n.helper';
import { KuraimiUserCheckRequest } from './dto/requests/kuraimi-user-check';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/infrastructure/entities/user/user.entity';
import { Repository } from 'typeorm';
import { Request } from 'express';

import { KuraimiUserResponse } from './dto/response/kuraimi-user-response';
import { encodeUUID } from 'src/core/helpers/cast.helper';
import { REQUEST } from '@nestjs/core';
import { FileInterceptor } from '@nestjs/platform-express';

import { UploadValidator } from 'src/core/validators/upload.validator';
import { EditPaymentMethodRequest } from './dto/requests/edit-payment-method.request';
import { applyQueryFilters } from 'src/core/helpers/service-related.helper';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { Roles } from '../authentication/guards/roles.decorator';
import { RolesGuard } from '../authentication/guards/roles.guard';
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
    applyQueryFilters(query, `is_active=1`);
    return new ActionResponse(
      this._i18nResponse.entity(
        (await this.paymentService.findAll(query)).map((payment) => {
          payment.logo = toUrl(payment.logo);
          return payment;
        }),
      ),
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('/admin')
  async getPaymentMethodsAmin(@Query() query: PaginatedRequest) {
    
    return new ActionResponse(
      (await this.paymentService.findAll(query)).map((payment) => {
        payment.logo = toUrl(payment.logo);
        return payment;
      }),
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @UseInterceptors(ClassSerializerInterceptor, FileInterceptor('logo'))
  @ApiConsumes('multipart/form-data')
  @Put()
  async editPaymentMethod(
    @Body() req: EditPaymentMethodRequest,
    @UploadedFile(new UploadValidator().build())
    logo: Express.Multer.File,
  ) {
    req.logo = logo;
    const editPaymentMethod = await this.paymentService.editPaymentMethod(req);

    return new ActionResponse(editPaymentMethod);
  }

  @Post('kuraimi/check-user')
  async checkUser(@Body() req: KuraimiUserCheckRequest) {
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
    // return await this.paymentService.kuraimiPay();
  }
}
