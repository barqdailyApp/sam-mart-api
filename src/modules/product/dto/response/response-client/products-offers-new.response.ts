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
import { ProductsNewResponse } from './products-new.response';
import { ProductOffer } from 'src/infrastructure/entities/product/product-offer.entity';
import { toUrl } from 'src/core/helpers/file.helper';

@Exclude()
export class ProductsOffersNewResponse {
  @Expose() section_id: string;
  @Expose() product_category_price_id: string;
  @Expose() category_sub_category_id: string;
  @Expose() is_quantity_available: boolean;
  @Expose() warehouse_quantity: number;

  @Expose() offer_id: string;
  @Expose() offer_price: number;
  @Expose() product_id: string;
  @Expose() product_name_ar: string;
  @Expose() product_name_en: string;
  @Expose() product_logo: string;
  @Expose() product_price_id: string;
  @Expose() product_price: number;
  @Expose() min_order_quantity: number;
  @Expose() mix_order_quantity: number;
  @Expose() product_measurement_id: string;
  @Expose() measurement_unit_id: string;
  @Expose() measurement_unit_ar: string;
  @Expose() measurement_unit_en: string;
  @Expose() cart_products: any;

  constructor(product_offer: ProductOffer) {
    const product_category_price = product_offer.product_category_price;
    const section_category =
      product_category_price.product_sub_category.category_subCategory
        .section_category;
    const product = product_category_price.product_sub_category.product;
    const product_measurement = product_category_price.product_measurement;
    const measurement_unit = product_measurement.measurement_unit;
    // const product_price =
    //   product_category_price.product_sub_category.product.product_measurements.find(
    //     (item) => item.id === product_measurement.id,
    //   ).product_category_prices[0];
    const cart_products = product_category_price.cart_products;

    // Manually setting the values based on the transformation logic
    this.section_id = section_category.section_id;
    this.product_category_price_id = product_category_price.id;
    this.category_sub_category_id =
      product_category_price.product_sub_category.category_sub_category_id;
    this.offer_id = product_offer.id;
    this.offer_price = product_offer.price;
    this.is_quantity_available =
      product.warehouses_products.reduce((acc, cur) => acc + cur.quantity, 0) ==
      0
        ? false
        : true;
    this.warehouse_quantity =
      product.warehouses_products.reduce((acc, cur) => acc + cur.quantity, 0) /
      product_measurement.conversion_factor;
    this.product_id = product.id;
    this.product_name_ar = product.name_ar;
    this.product_name_en = product.name_en;

    this.product_logo = toUrl(
      product.product_images.find((x) => x.is_logo === true)?.url,
    );
    this.product_price_id = product_category_price.id;
    this.product_price = product_category_price.price;
    this.min_order_quantity = product_offer.min_offer_quantity;
    this.mix_order_quantity = product_offer.max_offer_quantity;
    this.product_measurement_id = product_measurement.id;
    this.measurement_unit_id = measurement_unit.id;
    this.measurement_unit_ar = measurement_unit.name_ar;
    this.measurement_unit_en = measurement_unit.name_en;
    if (cart_products == undefined || cart_products.length == 0) {
      this.cart_products = null;
    } else {
      this.cart_products = {
        id: cart_products[0].id,
        cart_id: cart_products[0].cart_id,
        product_id: cart_products[0].product_id,
        quantity: cart_products[0].quantity,
        warehouse_quantity:
          product.warehouses_products.reduce(
            (acc, cur) => acc + cur.quantity,
            0,
          ) / cart_products[0].conversion_factor,
        min_order_quantity: product_offer.min_offer_quantity,
        max_order_quantity: product_offer.max_offer_quantity,
        price: cart_products[0].price,
        additions: cart_products[0].additions,
      };
    }
  }
}
