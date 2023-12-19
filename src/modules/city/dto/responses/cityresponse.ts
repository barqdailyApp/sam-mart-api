import { Exclude, Expose, Transform, plainToClass } from 'class-transformer';
import { Country } from 'src/infrastructure/entities/country/country.entity';
import { CountryResponse } from 'src/modules/country/dto/responses/country.response';

@Exclude()
export class CityResponse {

  @Expose() readonly id: string;

  @Expose() readonly name_ar: string;

  @Expose() readonly name_en: string;
  @Transform(
    ({ value }) =>
    plainToClass(CountryResponse, value),
  )
  @Expose()
  readonly country: CountryResponse;
  
}
