import { Exclude, Expose } from 'class-transformer';
import { PackagesServices } from 'src/infrastructure/entities/package/packages-services';
import { User } from 'src/infrastructure/entities/user/user.entity';

@Exclude()
export class ServiceResponse {
  @Expose() id: string;

  @Expose() name_ar: string;

  @Expose() name_en: string;

  @Expose() duration_by_minute: number;

  @Expose() price: number;
  constructor(partial: Partial<ServiceResponse>) {
    Object.assign(this, partial);
  }
}
