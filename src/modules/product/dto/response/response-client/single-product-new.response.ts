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
export class SingleProductsNewResponse {
  @Expose() product: any;
  @Expose() product_measurements: any[];

  constructor(product: Product) {
    const product_sub_category = product.product_sub_categories[0];
    const product_measurements = product.product_measurements;
    const product_images = product.product_images;
    let product_is_fav = false;
    if (product.products_favorite != undefined) {
      for (let i = 0; i < product.products_favorite.length; i++) {
        for (let j = 0; j < product.product_sub_categories.length; j++) {
          if (
            product.products_favorite[i].section_id ===
            product.product_sub_categories[j].category_subCategory
              .section_category.section_id
          ) {
            product_is_fav = true;
          }
        }
      }
    }
    // Manually setting the values based on the transformation logic
    this.product = {
      section_id:
        product_sub_category.category_subCategory.section_category.section.id,
      product_id: product.id,
      product_name_ar: product.name_ar,
      product_name_en: product.name_en,
      product_description_ar: product.description_ar,
      product_description_en: product.description_en,
      product_is_fav: product_is_fav,
      is_quantity_available:
        product.warehouses_products.reduce(
          (acc, cur) => acc + cur.quantity,
          0,
        ) == 0
          ? false
          : true,
      product_logo: toUrl(
        product.product_images.find((x) => x.is_logo === true)?.url,
      ),
      product_images: product_images.map((item) => toUrl(item.url)),
    };
    this.product_measurements = product_measurements.map((item) => {
      const product_category_price = item.product_category_prices[0];
      const cart_products = product_category_price.cart_products;
      const product_offer = product_category_price.product_offer;
      const product_additional_services =
        product_category_price.product_additional_services;
      return {
        product_measurement_id: item.id,
        conversion_factor: item.conversion_factor,
        is_main_unit: item.is_main_unit,
        measurement_unit_ar: item.measurement_unit.name_ar,
        measurement_unit_en: item.measurement_unit.name_en,

        warehouse_quantity:
          product.warehouses_products.reduce(
            (acc, cur) => acc + cur.quantity,
            0,
          ) / item.conversion_factor,
        min_order_quantity:
          product_offer != null
            ? product_offer.min_offer_quantity
            : product_category_price.min_order_quantity,
        max_order_quantity:
          product_offer != null
            ? product_offer.max_offer_quantity
            : product_category_price.max_order_quantity,
        offer: product_offer
          ? {
              product_category_price_id:
                product_offer.product_category_price_id,

              offer_id: product_offer.id,
              offer_price: product_offer.price,
            }
          : null,
        product_category_price: {
          product_category_price_id: product_category_price.id,
          product_price: product_category_price.price,
        },

        product_additional_services: product_additional_services.map((x) => {
          return {
            product_additional_service_id: x.id,
            price: x.price,
            additional_service: {
              additional_service_id: x.additional_service.id,
              name_ar: x.additional_service.name_ar,
              name_en: x.additional_service.name_en,
            },
          };
        }),
        cart_products:
          cart_products == undefined || cart_products.length == 0
            ? null
            : {
                id: cart_products[0].id,
                warehouse_quantity:
                  product.warehouses_products.reduce(
                    (acc, cur) => acc + cur.quantity,
                    0,
                  ) / cart_products[0].conversion_factor,
                cart_id: cart_products[0].cart_id,
                product_id: cart_products[0].product_id,
                quantity: cart_products[0].quantity,
                min_order_quantity: product_offer
                  ? product_offer.min_offer_quantity
                  : product_category_price.min_order_quantity,
                max_order_quantity: product_offer
                  ? product_offer.max_offer_quantity
                  : product_category_price.max_order_quantity,
                price:
                  Number(
                    product_offer
                      ? product_offer.price
                      : product_category_price.price,
                  ) +
                  Number(
                    cart_products[0].additions?.length > 0
                      ? product_additional_services.filter((j) => {
                          return cart_products[0].additions?.includes(j.id);
                        })[0].price
                      : 0,
                  ),
                additions: cart_products[0].additions,
              },
      };
    });
  }
}
