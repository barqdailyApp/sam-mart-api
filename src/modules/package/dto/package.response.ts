import { Exclude, Expose } from 'class-transformer';
import { PackagesServices } from 'src/infrastructure/entities/package/packages-services';
import { User } from 'src/infrastructure/entities/user/user.entity';
import { PackageServiceResponse } from '../../package-services/dto/package-services.response';
import { toUrl } from 'src/core/helpers/file.helper';

@Exclude()
export class PackageResponse {
  @Expose() id: string;

  @Expose() name_ar: string;

  @Expose() name_en: string;

  @Expose() price_wash_single: number;

  @Expose() wash_count: number;

  @Expose() description_ar: string;

  @Expose() description_en: string;

  @Expose() background_url: string;

  @Expose() expiry_date_in_days: number;

  @Expose() total_price_package: number;

  @Expose() order_by: number;

  @Expose() vat: number;

  @Expose() buy_by_points: number;

  
  @Expose() package_service: PackageServiceResponse[];

  @Expose()  background_url_internal :string;

  constructor(partial: Partial<PackageResponse>) {
    Object.assign(this, partial);
    //* convert path to url
    if (this.background_url) {
      if (this.background_url.includes('assets')) {
        this.background_url = toUrl(this.background_url, true);
      } else {
        this.background_url = toUrl(this.background_url);
      }
    }
  }
}
