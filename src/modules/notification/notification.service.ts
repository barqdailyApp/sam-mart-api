import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { FcmIntegrationService } from '../../integration/notify/fcm-integration.service';
import { UserService } from 'src/modules/user/user.service';
import { User } from 'src/infrastructure/entities/user/user.entity';
import { BaseUserService } from 'src/core/base/service/user-service.base';
import { NotificationEntity } from 'src/infrastructure/entities/notification/notification.entity';
import { PaginatedRequest } from 'src/core/base/requests/paginated.request';
import {
  applyQueryFilters,
  applyQuerySort,
} from 'src/core/helpers/service-related.helper';
import { SendToUsersNotificationRequest } from './dto/requests/send-to-users-notification.request';
import { NotificationTypes } from 'src/infrastructure/data/enums/notification-types.enum';
import { NotificationQuery } from './dto/filters/notification.query';

@Injectable()
export class NotificationService extends BaseUserService<NotificationEntity> {
  constructor(
    @InjectRepository(NotificationEntity)
    public _repo: Repository<NotificationEntity>,
    @Inject(REQUEST) request: Request,
    private readonly _userService: UserService,
    private readonly _fcmIntegrationService: FcmIntegrationService,
    @InjectRepository(User)
    public userRepository: Repository<User>,
  ) {
    super(_repo, request);
  }
  //get id and status from argument and update is read

  override async create(data: NotificationEntity) {
    data.is_read = false;
    console.log(data);
    const notification = await super.create(data);
    const recipient = await this._userService.findOne({
      id: notification.user_id,
    });
    if (recipient.fcm_token) {
      await this._fcmIntegrationService.send(
        recipient.fcm_token,
        notification['title_' + recipient.language],
        notification['text_' + recipient.language],
        {
          action: notification.type,
          action_id: notification.url,
        },
      );
    }
    if (!notification)
      throw new BadRequestException('message.notification_not_found');
    return notification;
  }
  async getAllMyNotifications(notificationQuery: NotificationQuery) {
    const { limit, page } = notificationQuery;
    const skip = (page - 1) * limit;

    const [notifications, total] = await this._repo
      .createQueryBuilder('notification')
      .where('notification.user_id = :user_id', {
        user_id: this.currentUser.id,
      })
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    // notifications Be seen by user
    for (let index = 0; index < notifications.length; index++) {
      this._repo.update(notifications[index].id, {
        is_read: true,
        seen_at: new Date(),
      });
    }

    return { notifications, total };
  }

  async sendToUsers(
    sendToUsersNotificationRequest: SendToUsersNotificationRequest,
  ) {
    const { users_id, message_ar, message_en, title_ar, title_en } =
      sendToUsersNotificationRequest;
    //* Check if user exists
    for (let index = 0; index < users_id.length; index++) {
      const user = await this.userRepository.findOne({
        where: { id: users_id[index] },
      });
      if (user) {
        this._repo.create(
          new NotificationEntity({
            user_id: users_id[index],
            url: users_id[index],
            type: NotificationTypes.USERS,
            title_ar: title_ar,
            title_en: title_en,
            text_ar: message_ar,
            text_en: message_en,
          }),
        );
      }
    }
  }
  
}
