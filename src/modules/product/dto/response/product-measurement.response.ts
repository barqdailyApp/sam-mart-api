import { Exclude, Expose, Transform, plainToClass } from 'class-transformer';
import { MeasurementUnitResponse } from 'src/modules/measurement-unit/dto/responses/measurement-unit.response';
import { ProductCategoryPriceResponse } from './product-category-price.response';

@Exclude()
export class ProductMeasurementResponse {
  @Expose() readonly id: string;

  @Expose() readonly conversion_factor: number;

  @Expose() readonly product_id: string;

  @Expose() readonly is_main_unit: boolean;

  @Transform(({ value }) => plainToClass(MeasurementUnitResponse, value))
  @Expose()
  readonly measurement_unit: MeasurementUnitResponse;

  @Transform(({ value }) => {
  
    return value && value.length > 0
      ? plainToClass(ProductCategoryPriceResponse, value)
      : null;
  })
  @Expose()
  readonly product_category_prices: ProductCategoryPriceResponse[];

  @Expose() readonly base_unit_id: string;
}
