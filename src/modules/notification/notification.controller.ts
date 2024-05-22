//create notification controller
import {
  Body,
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';

import { NotificationResponse } from './dto/response/notification.response';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from 'src/modules/authentication/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/authentication/guards/roles.guard';
import { I18nResponse } from 'src/core/helpers/i18n.helper';
import { User } from 'src/infrastructure/entities/user/user.entity';

import { ActionResponse } from 'src/core/base/responses/action.response';

import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SendToAllUsersNotificationRequest, SendToUsersNotificationRequest } from './dto/requests/send-to-users-notification.request';
import { NotificationQuery } from './dto/filters/notification.query';
import { PageMetaDto } from 'src/core/helpers/pagination/page-meta.dto';
import { PageDto } from 'src/core/helpers/pagination/page.dto';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { Roles } from '../authentication/guards/roles.decorator';

@ApiBearerAuth()
@ApiTags('Notifications')
@ApiHeader({
  name: 'Accept-Language',
  required: false,
  description: 'Language header: en, ar',
})
@Roles(Role.ADMIN, Role.CLIENT,Role.DRIVER)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('notification')
export class NotificationController {
  constructor(
    @Inject(I18nResponse) private readonly _i18nResponse: I18nResponse,
    private readonly notificationService: NotificationService,
    @InjectRepository(User)
    public userRepository: Repository<User>,
  ) {}
  @Roles(Role.ADMIN)
  @Post('send-to-users')
  async sendToUsers(
    @Body() sendToUsersNotificationRequest: SendToUsersNotificationRequest,
  ) {
    await this.notificationService.sendToUsers(sendToUsersNotificationRequest);
  }

  @Roles(Role.ADMIN)
  @Post('send-to-all')
  async sendToAll(
    @Body() sendToUsersNotificationRequest: SendToAllUsersNotificationRequest,
  ) {
  return new ActionResponse(  await this.notificationService.sendToALl(sendToUsersNotificationRequest));
  }
  @Get('all-My-Notifications')
  async allMyNotifications(@Query() notificationQuery: NotificationQuery) {
    const { limit, page } = notificationQuery;

    const { notifications, total } =
      await this.notificationService.getAllMyNotifications(notificationQuery);
    const notificationsResponse = notifications.map((notification) => {
      const notificationResponse =new NotificationResponse(notification);

      return notificationResponse;
    });
    const pageMetaDto = new PageMetaDto(page, limit, total);
    const data = this._i18nResponse.entity(notificationsResponse);
    const pageDto = new PageDto(data, pageMetaDto);

    return new ActionResponse(pageDto);
  }
}
