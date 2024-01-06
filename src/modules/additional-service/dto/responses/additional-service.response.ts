import { Exclude, Expose, Transform, plainToClass } from 'class-transformer';

@Exclude()
export class AdditionalServiceResponse {
  @Expose() readonly id: string;
  @Expose() readonly name_ar: string;
  @Expose() readonly name_en: string;
  @Expose() readonly created_at: Date;
  @Expose() readonly updated_at: Date;

}
