import { Exclude, Expose, Transform } from 'class-transformer';
import { toUrl } from 'src/core/helpers/file.helper';
import { Gender } from 'src/infrastructure/data/enums/gender.enum';

@Exclude()
export class UserResponse {
  @Expose() readonly id: string;
  @Expose() readonly username: string;
  @Expose() readonly email: string;
  @Expose() readonly phone: string;
  @Expose()
  @Transform((value) => value.obj.orders_completed > 3)
  readonly is_vip: boolean;
  @Transform(({ value }) => toUrl(value))
  @Expose()
  readonly avatar: string;
  @Expose() readonly birth_date: string;
  @Expose() readonly gender: Gender;
  @Expose() readonly name: string;
}
