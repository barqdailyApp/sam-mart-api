import { plainToInstance } from 'class-transformer';
import { toUrl } from 'src/core/helpers/file.helper';
import { Gender } from 'src/infrastructure/data/enums/gender.enum';
import { User } from 'src/infrastructure/entities/user/user.entity';
import { Double } from 'typeorm';

export class UserInfoResponse {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  allow_notification: boolean;
  email: string;
  birth_date: string;
  gender: string;

  constructor(partial: Partial<UserInfoResponse>) {
    this.id = partial.id;
    this.name = partial.name;
    this.avatar = partial.avatar;
    this.phone = partial.phone;
    this.email = partial.email;
    this.allow_notification = partial.allow_notification;
    this.birth_date = partial.birth_date;
    this.gender = partial.gender;

    if (!this.avatar) {
      this.avatar = this.gender == "female" ? "public/assets/images/avatar/female.png" : "public/assets/images/avatar/male.png"
    }

    if (this.avatar) {
      if (this.avatar.includes('assets')) {
        this.avatar = toUrl(this.avatar, true);
      } else {
        this.avatar = toUrl(this.avatar);
      }
    }
  }
}

export class ProfileResponse {
  user_info: UserInfoResponse;
  wash_balance: number;
  wash_time?: number;
  vehicles_count: number;
  points: number;
  notifications_is_read: boolean;
  points_per_wash: number
  IdLastOrderHaveReview?: string;
  constructor(partial: Partial<ProfileResponse>) {
    Object.assign(this, partial);
    this.user_info = new UserInfoResponse({ ...this.user_info });
  }
}
