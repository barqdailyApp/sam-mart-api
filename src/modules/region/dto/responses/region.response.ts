import { Exclude, Expose, Transform, plainToClass } from 'class-transformer';
import { CityResponse } from 'src/modules/city/dto/responses/cityresponse';

@Exclude()
export class RegionResponse {

  @Expose() readonly id: string;

  @Expose() readonly name_ar: string;

  @Expose() readonly name_en: string;

  @Transform(({ value }) => plainToClass(CityResponse, value))
  @Expose()
  readonly city: CityResponse;
  
}
