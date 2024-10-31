import { Exclude, Expose, Transform, plainToClass } from 'class-transformer';
import { toUrl } from 'src/core/helpers/file.helper';
import { ProductMeasurement } from 'src/infrastructure/entities/product/product-measurement.entity';
import { MeasurementUnitResponse } from 'src/modules/measurement-unit/dto/responses/measurement-unit.response';

import { ProductSubCategory } from 'src/infrastructure/entities/product/product-sub-category.entity';
import { CartProduct } from 'src/infrastructure/entities/cart/cart-products';
import { ProductMeasurementResponse } from '../product-measurement.response';
import { ProductImagesResponse } from '../product-images.response';
import { Product } from 'src/infrastructure/entities/product/product.entity';
import { Console } from 'console';
import { Warehouse } from 'src/infrastructure/entities/warehouse/warehouse.entity';
import { Subcategory } from 'src/infrastructure/entities/category/subcategory.entity';

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
      product_barcode: product.barcode,
      row_number: product.row_number,
      product_keywords: product.keywords,
      subcategory: product.product_sub_categories[0].category_subCategory.subcategory,
      Warehouse_products: product.warehouses_products.map((item) => {
        return {
          warehouse_id: item.warehouse.id,
          warehouse_name_ar: item.warehouse.name_ar,
          warehouse_name_en: item.warehouse.name_en,

          quantity: item.quantity,
        };
      }),
      quantity_available: product.warehouses_products.reduce(
        (acc, cur) => acc + cur.quantity,
        0,
      ),
      product_logo: toUrl(
        product.product_images.find((x) => x.is_logo === true)?.url,
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
    
      product_sub_category_id:
        product_sub_categories.length > 0
          ? product.product_sub_categories[0].id
          : null,
      product_sub_category_order_by:
        product.product_sub_categories.length > 0
          ? product.product_sub_categories[0].order_by
          : 0,
      product_sub_category_is_active:
        product.product_sub_categories.length > 0
          ? product.product_sub_categories[0].is_active
          : false,
      delivery_price:
        product.product_sub_categories.length > 0
          ? product.product_sub_categories[0].category_subCategory
              .section_category.section.delivery_price
          : 0,
    }),
      (this.product_measurements = product_measurements.map((item) => {
        const product_category_price = item.product_category_prices.filter(
          (x) => x.product_sub_category != null,
        );
        return {
          product_measurement_id: item.id,
          measurement_unit_id: item.measurement_unit.id,
          measurement_unit_ar: item.measurement_unit.name_ar,
          measurement_unit_en: item.measurement_unit.name_en,
          is_main_unit: item.is_main_unit,
          conversion_factor: item.conversion_factor,
          product_category_price:
            product_category_price.length > 0
              ? {
                  product_category_price_id: product_category_price[0].id,
                  product_price: product_category_price[0].price,
                  min_order_quantity:
                    product_category_price[0].min_order_quantity,
                  max_order_quantity:
                    product_category_price[0].max_order_quantity,
                }
              : null,

          product_additional_services:
            product_category_price.length > 0 &&
            product_category_price[0].product_additional_services.length > 0
              ? product_category_price[0].product_additional_services.map(
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
