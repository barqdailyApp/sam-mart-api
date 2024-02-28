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

import { NotificationResponse } from '../dto/notification.response';
import { ToggleRequest } from '../dto/requests/toggle.request';
import { NotificationService } from '../services/notification.service';
import { JwtAuthGuard } from 'src/modules/authentication/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/authentication/guards/roles.guard';
import { I18nResponse } from 'src/core/helpers/i18n.helper';
import { PaginatedRequest } from 'src/core/base/requests/paginated.request';
import { User } from 'src/infrastructure/entities/user/user.entity';
import { PaginatedResponse } from 'src/core/base/responses/paginated.response';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { Roles } from 'src/modules/authentication/guards/roles.decorator';
import { ActionResponse } from 'src/core/base/responses/action.response';
import { NotificationTypes } from 'src/infrastructure/data/enums/notification-types.enum';
import { NotificationEntity } from 'src/infrastructure/entities/notification/notification.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ReadNotificationsRequest } from '../dto/requests/read-notification.request';
import { SendToUsersNotificationRequest } from '../dto/requests/send-to-users-notification.request';

@ApiBearerAuth()
@ApiTags('Notifications')
@ApiHeader({
  name: 'Accept-Language',
  required: false,
  description: 'Language header: en, ar',
})
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('notification')
export class NotificationController {
  constructor(
    @Inject(I18nResponse) private readonly _i18nResponse: I18nResponse,
    private readonly notificationService: NotificationService,
    @InjectRepository(User)
    public userRepository: Repository<User>,
  ) {}

  @Get()
  async findAll(@Query() query: PaginatedRequest) {
    let result = await this.notificationService.findAll(query);
    result = this._i18nResponse.entity(result);
    const response = plainToInstance(NotificationResponse, result, {
      excludeExtraneousValues: true,
    });
    if (query.page && query.limit) {
      const total = await this.notificationService.count();
      return new PaginatedResponse<NotificationResponse[]>(response, {
        meta: { total, ...query },
      });
    } else {
      return new ActionResponse<NotificationResponse[]>(response);
    }
  }

  @Put('read-notifications')
  async readNotifications(
    @Body() readNotificationsRequest: ReadNotificationsRequest,
  ) {
    const { notification_ids } = readNotificationsRequest;
    for (let index = 0; index < notification_ids.length; index++) {
      await this.notificationService.toggleRead(true, notification_ids[index]);
    }
    return {
      message: 'success read notifications',
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DRIVER, Role.CLIENT)
  markAs(@Body() req: ToggleRequest, @Param('id') id: string) {
    let result = this.notificationService.toggleRead(req.isRead, id);
    result = this._i18nResponse.entity(result);
    const response = plainToInstance(NotificationResponse, result, {
      excludeExtraneousValues: true,
    });
    return new ActionResponse<NotificationResponse>(response);
  }

  @Post('send-to-users')
  async sendToUsers(
    @Body() sendToUsersNotificationRequest: SendToUsersNotificationRequest,
  ) {
    await this.notificationService.sendToUsers(sendToUsersNotificationRequest);
  }
}
