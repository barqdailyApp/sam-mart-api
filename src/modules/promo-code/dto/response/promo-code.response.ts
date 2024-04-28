import { Expose } from 'class-transformer';

export class PromoCodeResponse {
  @Expose()
  id: string;

  @Expose()
  code: string;

  @Expose()
  discount: number;
}
