import { plainToInstance } from 'class-transformer';
import { toUrl } from 'src/core/helpers/file.helper';
import { Points } from 'src/infrastructure/entities/points/point.entity';
import { User } from 'src/infrastructure/entities/user/user.entity';
import { Double } from 'typeorm';

export class UserInfoResponse {
  id: string;
  first_name: string;
  last_name: string;
  avatar: string;
  phone: string;
  notification_is_active: boolean;
  email: string;
  points: Points[];


  

  constructor(partial: Partial<UserInfoResponse>) {
    this.id = partial.id;
    this.first_name = partial.first_name;
    this.last_name = partial.last_name;
    this.avatar = partial.avatar;
    this.phone = partial.phone;
    this.email = partial.email;
    this.notification_is_active = partial.notification_is_active;

    if (this.avatar) {
      if (this.avatar.includes('assets')) {
        this.avatar = toUrl(this.avatar, true);
      } else {
        this.avatar = toUrl(this.avatar);
      }
    }
    this.points = partial.points;
  }
}

export class ProfileResponse {
  user_info: UserInfoResponse;
  wash_balance: number;
  wash_time?:number;
  vehicles_count: number;
  points: number;
  notifications_is_read: boolean;
  points_per_wash:number
  IdLastOrderHaveReview?:string;
  constructor(partial: Partial<ProfileResponse>) {
    Object.assign(this, partial);
    this.user_info = new UserInfoResponse({ ...this.user_info });
  }
}
