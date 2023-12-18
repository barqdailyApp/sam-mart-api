import { Inject, Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/infrastructure/entities/user/user.entity';
import { Repository } from 'typeorm';
import { BaseService } from 'src/core/base/service/service.base';
import { UploadFileRequest } from '../file/dto/requests/upload-file.request';
import { REQUEST } from '@nestjs/core';
import { FileService } from '../file/file.service';
import { Request } from 'express';
import { Subscription } from 'src/infrastructure/entities/subscription/subscription.entity';
import { ActionResponse } from 'src/core/base/responses/action.response';
import { ProfileResponse } from './dto/responses/profile.response';
import { SmsService } from '../sms/sms.service';
import { async } from 'rxjs';
import { Customer } from 'src/infrastructure/entities/customer/customer.entity';
import { Points } from 'src/infrastructure/entities/points/point.entity';
import { AppConstants } from 'src/infrastructure/entities/app-constants/app-constants.entity';
import { NotificationEntity } from 'src/infrastructure/entities/notification/notification.entity';
import { Order } from 'src/infrastructure/entities/order/order.entity';
import { OrderStatus } from 'src/infrastructure/data/enums/order-status.enum';
import { ReviewOrder } from 'src/infrastructure/entities/review-order/review-order.entity';

@Injectable({ scope: Scope.REQUEST })
export class UserService extends BaseService<User> {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(ReviewOrder)
    private readonly reviewOrderRepo: Repository<ReviewOrder>,

    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
    @InjectRepository(Points)
    private readonly pointRepo: Repository<Points>,
    @InjectRepository(AppConstants)
    private readonly appConstantsRepo: Repository<AppConstants>,
    @Inject(FileService) private _fileService: FileService,
    @Inject(SmsService) private smsSerivce: SmsService,
    @Inject(REQUEST) readonly request: Request,
    @InjectRepository(NotificationEntity)
    private readonly notificationRepo: Repository<NotificationEntity>,
  ) {
    super(userRepo);
  }
  //update image upload new delete old
  async updateImage(req: UploadFileRequest) {
    const user = this.request.user;

    if (req.file) {
      const tempImage = await this._fileService.upload(req, 'avatars');
      if (tempImage) {
        if (user.avatar) await this._fileService.delete(user.avatar);
        user.avatar = tempImage;
        await super.update(user);
      }
    } else
      try {
        await this._fileService.delete(user.avatar);
        user.avatar = null;
        await super.update(user);
      } catch (e) {}
    return user;
  }

  async testSms(phone: string, message: string) {
    return await this.smsSerivce.sendSMS(phone, message);
  }

  async getProfile() {
    const profile = await this._repo.findOne({
      where: { id: this.request.user.id },
      relations: { customer: { vehicles: true }, points: true },
    });

    const customer = await this.customerRepo.findOneBy({
      user_id: this.request.user.id,
    });
    const points_per_wash = await this.appConstantsRepo.find();

    let total_wash_count;
    if(customer){
       total_wash_count = await this.subscriptionRepo
      .createQueryBuilder('subscription')
      .where('subscription.customer_id = :id', { id: customer.id })
      .select('SUM(subscription.wash_count)', 'count')
      .getRawOne();
    }
 

    
    const total_points = await this.pointRepo
      .createQueryBuilder('points')
      .where('points.user_id = :id', { id: this.request.user.id })
      .select('SUM(points.points)', 'count')
      .getRawOne();

    const total_notification = await this.notificationRepo
      .createQueryBuilder('notification')
      .where('notification.user_id = :id', { id: this.request.user.id })
      .andWhere('notification.is_read = :is_read', { is_read: false })
      .getCount();
    const lastOrderComplete = await this.orderRepo.findOne({
      where: { customer_id: customer.id, status: OrderStatus.COMPLETED },
      order: { created_at: 'DESC' },
      relations: {},
    });
    const isLastOrderHaveReview = await this.reviewOrderRepo.findOne({
      where: { order_id: lastOrderComplete==null? '': lastOrderComplete.id },
    });
    console.log(total_wash_count);
    return new ActionResponse(
      new ProfileResponse({
        wash_time: points_per_wash[0].wash_time,
        points_per_wash: points_per_wash[0].client_wash_point,
        user_info: profile,
        notifications_is_read: total_notification > 0 ? false : true,
        points: Number(total_points['count']),
        vehicles_count: profile.customer.vehicles.length,
        IdLastOrderHaveReview: lastOrderComplete==null
          ? null
      : isLastOrderHaveReview!=null? null:lastOrderComplete.id,
        wash_balance: Number(total_wash_count['count']??0),
        
      }),
    );
  }
//lastOrderComplete.id
  async statusNotification(turn_on_off: boolean) {
    const user = this.request.user;
    user.notification_is_active = turn_on_off;
    await super.update(user);
  }

  async deleteImage() {
    const user = this.request.user;
    try {
      await this._fileService.delete(user.avatar);
    } catch (e) {}
    user.avatar = null;
    await super.update(user);

    return user;
  }
}
