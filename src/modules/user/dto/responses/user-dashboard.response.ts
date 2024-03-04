import { Exclude, Expose, Transform } from 'class-transformer';
import { toUrl } from 'src/core/helpers/file.helper';
import { Gender } from 'src/infrastructure/data/enums/gender.enum';
import { UserStatus } from 'src/infrastructure/data/enums/user-status.enum';
import { User } from 'src/infrastructure/entities/user/user.entity';

@Exclude()
export class UserDashboardResponse {
  @Expose() readonly id: string;
  @Expose() readonly username: string;
  @Expose() readonly email: string;
  @Expose() readonly phone: string;
  @Transform(({ value }) => toUrl(value))
  @Expose()
  readonly avatar: string;
  @Expose() readonly birth_date: string;
  @Expose() readonly created_at: Date;
  @Expose() readonly user_status: UserStatus;

  @Expose() readonly wallet_balance: number;
  @Expose() readonly main_address: any;

  constructor(user: User) {
    this.id = user.id;
    this.username = user.name;
    this.email = user.email;
    this.phone = user.phone;
    this.avatar = user.avatar;
    this.birth_date = user.birth_date;
    this.created_at = user.created_at;
    this.user_status = user.user_status;
    this.wallet_balance = user.wallet == undefined ? 0 : user.wallet.balance;

    const address = user.addresses.find(
      (address) => address.is_favorite === true,
    );
    this.main_address =
      address == null
        ? null
        : {
            id: address.id,
            address: address.address,
            latitude: address.latitude,
            longitude: address.longitude,
            name: address.name,
          };
  }
}
