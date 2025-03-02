import { Exclude, Expose, Transform, plainToClass } from 'class-transformer';
import { UserResponse } from '../../user/dto/responses/user.response';
import { DriverTypeEnum } from 'src/infrastructure/data/enums/driver-type.eum';

@Exclude()
export class DriverResponse {
  @Expose() id: string;
  @Expose() warehouse_id: string;

  @Expose() latitude: string;

  @Expose() longitude: string;

  @Expose() address: string;
  @Expose() is_receive_orders: boolean;

  @Expose() type: DriverTypeEnum;
  @Expose() @Transform(( value ) => value?.obj.user?.name) name: string;
  @Expose() @Transform(( value ) => value?.obj.user?.phone) phone: string;
  @Transform(({ value }) => plainToClass(UserResponse, value))
  @Expose()
  readonly user: UserResponse;
}
