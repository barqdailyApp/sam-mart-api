import { Exclude, Expose } from 'class-transformer';
import { ServiceResponse } from 'src/modules/service/dto/service.response';
import { UserInfoResponse } from 'src/modules/user/dto/responses/profile.response';
import { OrderBikerResponse } from './biker-order.response';

@Exclude()
export class BikerResponse {
  @Expose() id: string;

  @Expose() user: UserInfoResponse;

  @Expose() is_active: boolean;

  @Expose() orders_count: number;

  @Expose() latitude: number;

  @Expose() longitude: number;

  @Expose() notification_is_read?: boolean;

  constructor(partial: Partial<BikerResponse>) {
    this.id = partial.id;
    this.is_active = partial.is_active;
    this.orders_count = partial.orders_count;
    this.latitude = partial.latitude;
    this.longitude = partial.longitude;
    this.notification_is_read = partial.notification_is_read;

    if (partial.user) {
      this.user = new UserInfoResponse(partial.user);
    }
  }
}
