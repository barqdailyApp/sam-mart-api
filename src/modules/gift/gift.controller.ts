import { Body, Controller, Get, Inject, Post, Query, UseGuards } from '@nestjs/common';
import { GiftService } from './gift.service';
import { SendGiftRequest } from './dto/request/send-gift.request';
import { ActionResponse } from 'src/core/base/responses/action.response';
import { I18nResponse } from 'src/core/helpers/i18n.helper';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { RolesGuard } from '../authentication/guards/roles.guard';
import { Roles } from '../authentication/guards/roles.decorator';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { GiftResponse } from './dto/response/gift.response';
import { UserInfoResponse } from '../user/dto/responses/profile.response';
import { SubscriptionResponse } from '../subscription/dto/subscroption.response';
import { GiftFilterRequest } from './dto/request/order-filter.request';
import { SubscriptionRequest } from '../subscription/dto/subscription-request';
@ApiBearerAuth()
@ApiHeader({
  name: 'Accept-Language',
  required: false,
  description: 'Language header: en, ar',
})
@ApiTags('gift')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('gift')
export class GiftController {
  constructor(
    private readonly gift_service: GiftService,
    @Inject(I18nResponse) private readonly _i18nResponse: I18nResponse,
  ) {}
  @Roles(Role.ADMIN)
  @Post('/:id')
  async sendGift(@Body() request: SubscriptionRequest) {
    const gift = await this.gift_service.sendGift(request);
    console.log('gift', gift);
    const gifts_dto = new GiftResponse({
      sender: new UserInfoResponse(gift.sender.user),
      subscription: new SubscriptionResponse(gift.subscription),
      receiver: new UserInfoResponse(gift.receiver.user),
    });

    return new ActionResponse(this._i18nResponse.entity(gifts_dto));
  }
  @Roles(Role.CLIENT)
  @Get('/all-gifts')
  async allGiftsSender(@Query() giftFilterRequest: GiftFilterRequest) {
    const gifts = await this.gift_service.allGiftsSender(giftFilterRequest);

    const gifts_dto = gifts.map(
      (gift) =>
        new GiftResponse({
          sender: new UserInfoResponse(gift.sender.user),
          subscription: new SubscriptionResponse(gift.subscription),
          receiver: new UserInfoResponse(gift.receiver.user),
        }),
    );
    return new ActionResponse(this._i18nResponse.entity(gifts_dto));
  }
}
