import { Body, Controller, Get, Inject, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { RolesGuard } from '../authentication/guards/roles.guard';
import { PointService } from './point.service';
import { Roles } from '../authentication/guards/roles.decorator';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { SendToUsersRequest } from './dto/send-to-users.request';
import { ActionResponse } from 'src/core/base/responses/action.response';
import { SubscriptionService } from '../subscription/subscription.service';
import { SubscriptionRequest } from '../subscription/dto/subscription-request';
import { I18nResponse } from 'src/core/helpers/i18n.helper';
@ApiBearerAuth()
@ApiHeader({
  name: 'Accept-Language',
  required: false,
  description: 'Language header: en, ar',
})
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Point')
@Controller('point')
export class PointController {
  constructor(
    private readonly pointService: PointService,
    private readonly subscriptionService: SubscriptionService,
    @Inject(I18nResponse) private readonly _i18nResponse: I18nResponse,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('send-point-to-users')
  async sendPoints(@Body() sendToUsersRequest: SendToUsersRequest) {
    await this.pointService.sendPoints(sendToUsersRequest);
    return 'Done Successfully Send Points';
  }

  @Get('points-data')
  async getPointsData() {
    
      const data= await this.pointService.getPointsData();
    
      const result= this._i18nResponse.entity(data);
      return new ActionResponse (result)
  }

  @Roles(Role.CLIENT)
  @Post('redeem-points')
  async redeem() {
    const data = await this.pointService.redeem();
    console.log(data);
    if (data) {
      await this.subscriptionService.addSubscription(
        new SubscriptionRequest({
          package_id: data.id,
          user_id: this.pointService.currentUser.id,
          services: [],
        }),
      );
      return new ActionResponse('Success');
    }

    return new ActionResponse('Failed');
  }
}
