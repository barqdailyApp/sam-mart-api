import { Exclude, Expose } from 'class-transformer';
import { toUrl } from 'src/core/helpers/file.helper';

@Exclude()
export class SocialMediaResponse {

  @Expose() icon: string;

  @Expose() link: string;
  @Expose() scheme: string;

  constructor(data: Partial<SocialMediaResponse>) {
    Object.assign(this, data);
    //* convert path to url
    if (this.icon) {
      if (this.icon.includes('assets')) {
        this.icon = toUrl(this.icon, true);
      } else {
        this.icon = toUrl(this.icon);
      }
    }
  }
}
