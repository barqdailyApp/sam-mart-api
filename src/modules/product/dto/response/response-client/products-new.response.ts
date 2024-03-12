import { Exclude, Expose, Transform, plainToClass } from 'class-transformer';
import { toUrl } from 'src/core/helpers/file.helper';
import { ProductMeasurement } from 'src/infrastructure/entities/product/product-measurement.entity';
import { MeasurementUnitResponse } from 'src/modules/measurement-unit/dto/responses/measurement-unit.response';

import { ProductSubCategory } from 'src/infrastructure/entities/product/product-sub-category.entity';
import { CartProduct } from 'src/infrastructure/entities/cart/cart-products';
import { ProductMeasurementResponse } from '../product-measurement.response';
import { ProductImagesResponse } from '../product-images.response';
import { Product } from 'src/infrastructure/entities/product/product.entity';

@Exclude()
export class ProductsNewResponse {
  @Expose() section_id: string;
  @Expose() product_category_price_id: string;
  @Expose() is_quantity_available: boolean;
  @Expose() warehouse_quantity: number;

  @Expose() offer_id: string | null;
  @Expose() offer_price: number | null;
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

  constructor(product: Product) {
    const product_measurement = product.product_measurements.find(
      (item) => item.is_main_unit === true,
    );
    const product_category_price =
      product_measurement.product_category_prices[0];
    const product_sub_category = product.product_sub_categories[0];
    const measurement_unit = product_measurement.measurement_unit;
    const cart_products = product_category_price.cart_products;
    const product_offer = product_category_price.product_offer;

    // Manually setting the values based on the transformation logic
    this.section_id =
      product_sub_category.category_subCategory.section_category.section_id;
    this.product_category_price_id = product_category_price.id;
    this.offer_id = product_offer ? product_offer.id : null;
    this.offer_price = product_offer ? product_offer.price : null;
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
      product.product_images.find((x) => x.is_logo === true).url,
    );
    this.product_price_id = product_category_price.id;
    this.product_price = product_category_price.price;
    (this.min_order_quantity = product_offer
      ? product_offer.min_offer_quantity
      : product_category_price.min_order_quantity),
      (this.mix_order_quantity = product_offer
        ? product_offer.max_offer_quantity
        : product_category_price.max_order_quantity),
      (this.product_measurement_id = product_measurement.id);
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
        min_order_quantity: product_offer
          ? product_offer.min_offer_quantity
          : product_category_price.min_order_quantity,
        max_order_quantity: product_offer
          ? product_offer.max_offer_quantity
          : product_category_price.max_order_quantity,
        price: cart_products[0].price,
        additions: cart_products[0].additions,
      };
    }
  }
}
