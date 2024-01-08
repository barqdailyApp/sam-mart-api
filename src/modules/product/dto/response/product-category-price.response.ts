import { Exclude, Expose, Transform, plainToClass } from 'class-transformer';
import { toUrl } from 'src/core/helpers/file.helper';
import { ProductMeasurement } from 'src/infrastructure/entities/product/product-measurement.entity';
import { MeasurementUnitResponse } from 'src/modules/measurement-unit/dto/responses/measurement-unit.response';
import { ProductMeasurementResponse } from './product-measurement.response';
import { ProductImagesResponse } from './product-images.response';
import { ProductAdditionalServiceResponse } from './product-additional-service.response';
import { DiscountType } from 'src/infrastructure/data/enums/discount-type.enum';
import { ProductOfferResponse } from './product-offer.response';

@Exclude()
export class ProductCategoryPriceResponse {
  @Expose() readonly id: string;
  @Expose() readonly product_measurement_id: string;
  @Expose() readonly product_sub_category_id: string;
  @Expose() readonly price: number;
  @Expose() readonly min_order_quantity: number;
  @Expose() readonly max_order_quantity: number;

  @Transform(({ value }) => plainToClass(ProductOfferResponse, value))
  @Expose()
  readonly product_offer: ProductOfferResponse;

  @Expose() readonly created_at: Date;
  @Expose() readonly updated_at: Date;

  // details offers
  @Transform(({ value }) =>
    plainToClass(ProductAdditionalServiceResponse, value),
  )
  @Expose()
  readonly product_additional_services: ProductAdditionalServiceResponse[];
}
