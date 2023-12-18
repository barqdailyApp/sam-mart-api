import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { SubscriptionService } from './subscription.service';
import { I18nResponse } from 'src/core/helpers/i18n.helper';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { RolesGuard } from '../authentication/guards/roles.guard';
import { applyQueryFilters } from 'src/core/helpers/service-related.helper';
import { PaginatedRequest } from 'src/core/base/requests/paginated.request';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from 'src/infrastructure/entities/customer/customer.entity';
import { Repository } from 'typeorm';
import { ActionResponse } from 'src/core/base/responses/action.response';
import { SubscriptionRequest } from './dto/subscription-request';
import { SubscriptionResponse } from './dto/subscroption.response';
import { SubscriptionsFilterRequest } from './dto/subscriptions-filter.request';
import { plainToInstance } from 'class-transformer';
@ApiBearerAuth()
@ApiHeader({
  name: 'Accept-Language',
  required: false,
  description: 'Language header: en, ar',
})
@ApiTags('Subscription')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('subscription')
export class SubscriptionController {
  constructor(
    private readonly subscription_service: SubscriptionService,
    @Inject(I18nResponse) private readonly _i18nResponse: I18nResponse,
  ) {}

  @Post('/:id')
  async addSubscription(@Body() request: SubscriptionRequest) {
    const subscription = await this.subscription_service.addSubscription(
      request,
    );
    return new ActionResponse(
      this._i18nResponse.entity(
        await this.subscription_service.findOne(subscription.id),
      ),
    );
  }
  @Post('/change-expire-date-subscription/:id/:new_expire')
  async changeExpireDateSubscription(
    @Param('id') id: string,
    @Param('new_expire') new_expire: Date,
  ) {
    const subscription =
      await this.subscription_service.changeExpireDateSubscription(
        new_expire,
        id,
      );
    return new ActionResponse(
      this._i18nResponse.entity(
        await this.subscription_service.findOne(subscription.id),
      ),
    );
  }
  @Get('/:id')
  async singleSubscription(@Param('id') id: string) {
    const subscription_current =
      await this.subscription_service.singleSubscription(id);
    const subscription_dto = new SubscriptionResponse(subscription_current);
    const subscription_res = this._i18nResponse.entity(subscription_dto);
    return subscription_res;
  }

  // @Get()
  // async findall(@Query() query: PaginatedRequest) {
  //   return new ActionResponse(
  //     this._i18nResponse.entity(await this.subscription_service.findAll(query)),
  //   );
  // }

  @Get()
  async allSubscription(
    @Query() subscriptionsFilterRequest: SubscriptionsFilterRequest,
  ) {
    const subscriptions_current =
      await this.subscription_service.allSubscription(
        subscriptionsFilterRequest,
      );
    const subscriptions_dto = subscriptions_current.map(
      (item) => new SubscriptionResponse(item),
    );
    const subscriptions_res = this._i18nResponse.entity(subscriptions_dto);
    return new ActionResponse(subscriptions_res);
  }
}
