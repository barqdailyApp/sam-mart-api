import { ProductMeasurement } from 'src/infrastructure/entities/product/product-measurement.entity';
import { MeasurementUnitResponse } from 'src/modules/measurement-unit/dto/responses/measurement-unit.response';
import { ProductMeasurementResponse } from './product-measurement.response';
import { ProductImagesResponse } from './product-images.response';
import { ProductAdditionalServiceResponse } from './product-additional-service.response';
import { Exclude, Expose, Transform, plainToClass } from 'class-transformer';
import { DiscountType } from 'src/infrastructure/data/enums/discount-type.enum';
import { Cart } from 'src/infrastructure/entities/cart/cart.entity';
import { ProductCategoryPriceResponse } from './product-category-price.response';

@Exclude()
export class CartProductResponse {
  @Expose() readonly id: string;

  // @Transform(({ value }) => plainToClass(Cart, value))
  // @Expose()
  // readonly cart: Cart;

  @Expose() readonly product_id: string;

  @Expose() readonly section_id: string;

  @Expose() readonly quantity: number;

  @Expose() readonly main_measurement_id: string;

  @Expose() readonly conversion_factor: number;

  // @Transform(({ value }) => plainToClass(ProductCategoryPriceResponse, value))
  // @Expose()
  // readonly product_category_price: ProductCategoryPriceResponse;

  @Expose() readonly product_category_price_id: string;

  @Expose() readonly is_offer: boolean;

  @Transform(({ obj }) => {
    if (obj.product_category_price.product_offer) {
      return obj.product_category_price.product_offer.min_offer_quantity;
    }
    return obj.product_category_price.min_order_quantity;
  })
  @Expose()
  readonly min_order_quantity: number;
  @Transform(({ obj }) => {
    if (obj.product_category_price.product_offer) {
      return obj.product_category_price.product_offer.max_offer_quantity;
    }
    return obj.product_category_price.max_order_quantity;
  })
  @Expose()
  readonly max_order_quantity: number;

  @Expose() readonly price: number;

  @Expose() readonly additions: string[];
}
