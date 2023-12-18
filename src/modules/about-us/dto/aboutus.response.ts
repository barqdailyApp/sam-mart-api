import { Exclude, Expose } from 'class-transformer';
import { toUrl } from 'src/core/helpers/file.helper';

@Exclude()
export class AboutUsResponse {
  @Expose() title_ar: string;

  @Expose() title_en: string;

  @Expose() description_ar: string;

  @Expose() description_en: string;

  @Expose() background_image_url: string;
  constructor(data: Partial<AboutUsResponse>) {
    Object.assign(this, data);
    //* convert path to url
    if (this.background_image_url) {
      if (this.background_image_url.includes('assets')) {
        this.background_image_url = toUrl(this.background_image_url, true);
      } else {
        this.background_image_url = toUrl(this.background_image_url);
      }
    }
  }
}
