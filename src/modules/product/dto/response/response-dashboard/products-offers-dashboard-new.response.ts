import { ProductMeasurement } from 'src/infrastructure/entities/product/product-measurement.entity';
import { MeasurementUnitResponse } from 'src/modules/measurement-unit/dto/responses/measurement-unit.response';
import { ProductMeasurementResponse } from '../product-measurement.response';
import { ProductImagesResponse } from '../product-images.response';
import { ProductAdditionalServiceResponse } from '../product-additional-service.response';
import {
  Exclude,
  Expose,
  Transform,
  plainToClass,
  plainToInstance,
} from 'class-transformer';
import { DiscountType } from 'src/infrastructure/data/enums/discount-type.enum';
import { ProductResponse } from '../product.response';
import { Console } from 'console';
import { ProductOffer } from 'src/infrastructure/entities/product/product-offer.entity';
import { toUrl } from 'src/core/helpers/file.helper';

@Exclude()
export class ProductsOffersDashboardNewResponse {
  @Expose() offer_id: string;
  @Expose() offer_price: number;
  @Expose() offer_is_active: boolean;
  @Expose() offer_discount_type: DiscountType;
  @Expose() offer_discount_value: number;
  @Expose() offer_start_date: Date;
  @Expose() offer_end_date: Date;
  @Expose() offer_quantity: number;
  @Expose() product_category_price_id: string;

  @Expose() min_order_quantity: number;
  @Expose() mix_order_quantity: number;

  @Expose() product_id: string;
  @Expose() product_barcode: string;

  @Expose() name_ar: string;
  @Expose() name_en: string;
  @Expose() product_logo: string;

  @Expose() product_offer_description_ar: string;
  @Expose() product_offer_description_en: string;

  @Expose() product_measurement_id: string;
  @Expose() measurement_unit_id: string;
  @Expose() measurement_unit_ar: string;
  @Expose() measurement_unit_en: string;
  @Expose() order_by: number;

  constructor(product_offer: ProductOffer) {

    const product_category_price = product_offer.product_category_price;
    const product = product_category_price.product_sub_category.product;
    const product_measurement = product_category_price.product_measurement;
    const measurement_unit = product_measurement.measurement_unit;

    // Manually setting the values based on the transformation logic

    this.offer_id = product_offer.id;
    this.offer_price = product_offer.price;
    this.order_by = product_offer.order_by;
    this.min_order_quantity = product_offer.min_offer_quantity;
    this.mix_order_quantity = product_offer.max_offer_quantity;
    this.offer_is_active = product_offer.is_active;
    this.offer_discount_value = product_offer.discount_value;
    this.offer_discount_type = product_offer.discount_type;
    this.offer_start_date = product_offer.start_date;
    this.offer_end_date = product_offer.end_date;
    this.offer_quantity = product_offer.offer_quantity;
    
    this.product_category_price_id = product_offer.product_category_price_id;


    this.product_id = product.id;
    this.product_barcode = product.barcode;
    this.name_ar = product.name_ar;
    this.name_en = product.name_en;

    this.product_logo = toUrl(
      product.product_images.find((x) => x.is_logo === true)?.url,
    );

    this.product_offer_description_ar = product_offer.description_ar;
    this.product_offer_description_en = product_offer.description_en;

    this.product_measurement_id = product_measurement.id;
    this.measurement_unit_id = measurement_unit.id;
    this.measurement_unit_ar = measurement_unit.name_ar;
    this.measurement_unit_en = measurement_unit.name_en;
  }
}
