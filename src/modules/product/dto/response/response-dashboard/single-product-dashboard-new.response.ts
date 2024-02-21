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
export class SingleProductDashboardNewResponse {
  @Expose() product: any;
  @Expose() product_sub_category: any;

  @Expose() product_measurements: any[];

  constructor(product: Product) {
    const product_sub_categories = product.product_sub_categories;
    const product_measurements = product.product_measurements;
    const product_images = product.product_images;

    // Manually setting the values based on the transformation logic
    this.product = {
      product_sub_category_id:
        product_sub_categories.length > 0 ? product_sub_categories[0].id : null,
      product_id: product.id,
      name_ar: product.name_ar,
      name_en: product.name_en,
      product_description_ar: product.description_ar,
      product_description_en: product.description_en,
      product_is_active: product.is_active,
      product_is_recovered: product.is_recovered,
      quantity_available: product.warehouses_products.reduce(
        (acc, cur) => acc + cur.quantity,
        0,
      ),
      product_logo: toUrl(
        product.product_images.find((x) => x.is_logo === true).url,
      ),
      product_images: product_images.map((item) => {
        return {
          url: toUrl(item.url),
          id: item.id,
          is_logo: item.is_logo,
        };
      }),
    };
    (this.product_sub_category = {
      product_sub_category_id: product_sub_categories.length > 0 ? product.product_sub_categories[0].id : null,
      product_sub_category_order_by:
        product.product_sub_categories.length > 0
          ? product.product_sub_categories[0].order_by
          : 0,
      product_sub_category_is_active:
        product.product_sub_categories.length > 0
          ? product.product_sub_categories[0].is_active
          : false,
    }),
      (this.product_measurements = product_measurements.map((item) => {
        return {
          product_measurement_id: item.id,
          measurement_unit_ar: item.measurement_unit.name_ar,
          measurement_unit_en: item.measurement_unit.name_en,
          is_main_unit: item.is_main_unit,
          conversion_factor: item.conversion_factor,
          product_category_price:
            item.product_category_prices.length > 0
              ? {
                  product_category_price_id: item.product_category_prices[0].id,
                  product_price: item.product_category_prices[0].price,
                }
              : null,

          product_additional_services:
            item.product_category_prices.length > 0 &&
            item.product_category_prices[0].product_additional_services.length >
              0
              ? item.product_category_prices[0].product_additional_services.map(
                  (x) => {
                    return {
                      product_additional_service_id: x.id,
                      price: x.price,
                      additional_service: {
                        additional_service_id: x.additional_service.id,
                        name_ar: x.additional_service.name_ar,
                        name_en: x.additional_service.name_en,
                      },
                    };
                  },
                )
              : null,
        };
      }));
  }
}
