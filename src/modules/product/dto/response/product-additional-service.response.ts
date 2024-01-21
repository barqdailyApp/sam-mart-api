import { Exclude, Expose, Transform, plainToClass } from 'class-transformer';
import { toUrl } from 'src/core/helpers/file.helper';
import { ProductMeasurement } from 'src/infrastructure/entities/product/product-measurement.entity';
import { MeasurementUnitResponse } from 'src/modules/measurement-unit/dto/responses/measurement-unit.response';
import { ProductMeasurementResponse } from './product-measurement.response';
import { ProductImagesResponse } from './product-images.response';
import { AdditionalServiceResponse } from 'src/modules/additional-service/dto/responses/additional-service.response';

@Exclude()
export class ProductAdditionalServiceResponse {
  @Expose() readonly id: string;
  @Expose() readonly product_category_price_id: string;
  @Expose() readonly additional_service_id: string;
  @Expose() readonly price: number;
  @Expose() readonly created_at: Date;
  @Expose() readonly updated_at: Date;
  @Transform(({ value }) => plainToClass(AdditionalServiceResponse, value))
  @Expose()
  readonly additional_service: AdditionalServiceResponse;
}
