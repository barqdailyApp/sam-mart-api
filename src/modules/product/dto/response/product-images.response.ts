import { Exclude, Expose, Transform, plainToClass } from 'class-transformer';
import { toUrl } from 'src/core/helpers/file.helper';
import { MeasurementUnitResponse } from 'src/modules/measurement-unit/dto/responses/measurement-unit.response';

@Exclude()
export class ProductImagesResponse {
  @Expose() readonly id: string;
  
  @Transform(({ value }) => toUrl(value))
  @Expose() readonly url: string;


}
