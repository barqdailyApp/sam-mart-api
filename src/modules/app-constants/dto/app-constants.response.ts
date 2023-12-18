import { Exclude, Expose } from 'class-transformer';
import { toUrl } from 'src/core/helpers/file.helper';

@Exclude()
export class AppConstantsResponse {
  @Expose() logo_app: string;

  @Expose() company_address: string;

  @Expose() tax_rate: number;

  @Expose() biker_wash_point: number;
  @Expose() client_wash_point: number;
  @Expose() vat_number: string;

  constructor(data: Partial<AppConstantsResponse>) {
    Object.assign(this, data);
    //* convert path to url
    if (this.logo_app) {
      if (this.logo_app.includes('assets')) {
        this.logo_app = toUrl(this.logo_app, true);
      } else {
        this.logo_app = toUrl(this.logo_app);
      }
    }
  }
}
