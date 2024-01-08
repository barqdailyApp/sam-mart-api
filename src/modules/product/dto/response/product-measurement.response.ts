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
    // console.log(value[0]);
    // if (value[0].product_offer) {
    //   value[0].price = value[0].product_offer.price;
    //   value[0].min_order_quantity = value[0].product_offer.min_offer_quantity;
    //   value[0].max_order_quantity = value[0].product_offer.max_offer_quantity;
    //   value[0].start_date = value[0].product_offer.start_date;
    //   value[0].end_date = value[0].product_offer.end_date;
    //   value[0].offer_is_active = value[0].product_offer.is_active;
    //   value[0].discount_type = value[0].product_offer.discount_type;
    //   value[0].discount_value = value[0].product_offer.discount_value;
    //   value[0].product_offer_id = value[0].product_offer.id;
    //   value[0].offer_quantity = value[0].product_offer.offer_quantity;
    // }
    // Proceed with your original transformation logic
    return value && value.length > 0
      ? plainToClass(ProductCategoryPriceResponse, value[0])
      : null;
  })
  @Expose()
  readonly product_category_prices: ProductCategoryPriceResponse;

  @Expose() readonly base_unit_id: string;
}
