import { Exclude, Expose, Transform, plainToClass } from 'class-transformer';

@Exclude()
export class AdditionalServiceResponse {
  @Expose() readonly id: string;
  @Expose() readonly name_ar: string;
  @Expose() readonly name_en: string;

}
