import { Exclude, Expose, Transform, plainToClass } from 'class-transformer';

@Exclude()
export class MeasurementUnitResponse {
  @Expose() readonly id: string;
  @Expose() readonly name_ar: string;
  @Expose() readonly name_en: string;

}
