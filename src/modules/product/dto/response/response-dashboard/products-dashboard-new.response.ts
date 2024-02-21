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
export class ProductsDashboardNewResponse {
  @Expose() readonly product_id: string;

  @Expose() readonly product_name_ar: string;

  @Expose() readonly product_name_en: string;

  @Expose() readonly product_logo: string;

  @Expose() readonly product_is_active: boolean;

  @Expose() readonly product_is_recovered: boolean;

  @Expose() readonly quantity_available: number;

  @Expose() readonly product_sub_category_id: string;

  @Expose() readonly product_sub_category_order_by: number;

  @Expose() readonly product_sub_category_is_active: boolean;

  @Expose() readonly measurement_unit_ar: string;

  @Expose() readonly measurement_unit_en: string;

  constructor(product: Product) {
    const product_measurement = product.product_measurements.find(
      (item) => item.is_main_unit === true,
    );

    const measurement_unit = product_measurement.measurement_unit;

    this.product_id = product.id;
    this.product_name_ar = product.name_ar;
    this.product_name_en = product.name_en;
    this.product_logo = toUrl(
      product.product_images.find((x) => x.is_logo === true).url,
    );
    this.product_is_active = product.is_active;
    this.product_is_recovered = product.is_recovered;
    this.quantity_available = product.warehouses_products.reduce(
      (acc, cur) => acc + cur.quantity,
      0,
    );
    this.product_sub_category_id = 
    product.product_sub_categories.length > 0
      ? product.product_sub_categories[0].id
      : null
    this.product_sub_category_order_by =
      product.product_sub_categories.length > 0
        ? product.product_sub_categories[0].order_by
        : 0;
    this.product_sub_category_is_active =
      product.product_sub_categories.length > 0
        ? product.product_sub_categories[0].is_active
        : false;
    this.measurement_unit_ar = measurement_unit.name_ar;
    this.measurement_unit_en = measurement_unit.name_en;
  }
}
