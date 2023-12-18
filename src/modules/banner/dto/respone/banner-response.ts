import { Expose, Transform } from 'class-transformer';
import { toUrl } from 'src/core/helpers/file.helper';

export class BannerResponse {
  @Expose() id: string;
  @Expose() name: string;
  @Expose() end_time: Date;

  @Expose() @Transform(({ value }) => toUrl(value)) image: string;
}
