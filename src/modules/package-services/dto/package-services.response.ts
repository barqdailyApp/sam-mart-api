import { Exclude, Expose } from 'class-transformer';
import { PackagesServices } from 'src/infrastructure/entities/package/packages-services';
import { User } from 'src/infrastructure/entities/user/user.entity';
import { ServiceResponse } from 'src/modules/service/dto/service.response';

@Exclude()
export class PackageServiceResponse {
  @Expose() id: string;

  @Expose() package_id: string;

  @Expose() service_count: number;

  @Expose() is_active: boolean;

  @Expose() total_service_price: number;

  @Expose() service: ServiceResponse;

  constructor(partial: Partial<PackageServiceResponse>) {
    Object.assign(this, partial);
  }
}
