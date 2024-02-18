import { Exclude, Expose, Transform, plainToClass } from 'class-transformer';
import { UserResponse } from '../../user/dto/responses/user.response';

@Exclude()
export class DriverResponse {
  @Expose() id: string;
  @Expose() warehouse_id: string;

  @Expose() latitude: string;

  @Expose() longitude: string;

  @Expose() address: string;
  @Expose() is_receive_orders: boolean;

  @Transform(({ value }) => plainToClass(UserResponse, value))
  @Expose()
  readonly user: UserResponse;
}
