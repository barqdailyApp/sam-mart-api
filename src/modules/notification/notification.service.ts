import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
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
import {
  SendToAllUsersNotificationRequest,
  SendToUsersNotificationRequest,
} from './dto/requests/send-to-users-notification.request';
import { NotificationTypes } from 'src/infrastructure/data/enums/notification-types.enum';
import { NotificationQuery } from './dto/filters/notification.query';
import { Roles } from '../authentication/guards/roles.decorator';
import { Role } from 'src/infrastructure/data/enums/role.enum';

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
    if(data.user_id == null) return;
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
      .orderBy('notification.created_at', 'DESC')
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
    const BATCH_SIZE = 10; // Adjust batch size based on your server's capacity

    for (let i = 0; i < users_id.length; i += BATCH_SIZE) {
      const userBatch = users_id.slice(i, i + BATCH_SIZE);

      const notificationPromises = userBatch.map(async (userId) => {
        const user = await this.userRepository.findOne({
          where: { id: userId },
        });
        if (user) {
          return this.create(
            new NotificationEntity({
              user_id: userId,
              url: userId,
              type: NotificationTypes.USERS,
              title_ar: title_ar,
              title_en: title_en,
              text_ar: message_ar,
              text_en: message_en,
            }),
          );
        }
      });

      // Wait for all notifications in the batch to be processed
      await Promise.all(notificationPromises).catch((error) => {
        // Log the error or handle it as needed
        console.error('Error sending notifications:', error);
      });
    }
  }
  async sendToALl(
    sendToUsersNotificationRequest: SendToAllUsersNotificationRequest,
  ) {
    const { message_ar, message_en, title_ar, title_en } =
      sendToUsersNotificationRequest;

    const users = await this.userRepository.find({where:{roles:Role.CLIENT}});

    users.map(async (user) => {
      return this.create(
        new NotificationEntity({
          user_id: user.id,
          url: user.id,
          type: NotificationTypes.USERS,
          title_ar: title_ar,
          title_en: title_en,
          text_ar: message_ar,
          text_en: message_en,
        }),
      );
    });
    return "notification sent successfully";
  }
  async sendTousers(data: SendToAllUsersNotificationRequest, users: User[]) {


    this._fcmIntegrationService.sendToAll(
     users.map((user) => user.fcm_token),
     data.title_ar,
     data.message_ar,
     {
       action: NotificationTypes.USERS,
       action_id: NotificationTypes.USERS,
       image_url: data.image_url,
     },
   );
  //  const notifications = [];
  //  for (let index = 0; index < users.length; index++) {
  //    const user = users[index];
  //    notifications.push(
  //      new NotificationEntity({
  //        user_id: users[index].id,
  //        url: users[index].id,
  //        type: NotificationTypes.USERS,
  //        title_ar: data.title_ar,
  //        title_en: data.title_en,
  //        text_ar: data.message_ar,
  //        text_en: data.message_en,
  //      }),
  //    );
  //  }

  //  await this._repo.save(notifications);
   return true;
 }
}
