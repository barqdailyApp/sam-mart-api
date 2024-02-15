import { Expose } from 'class-transformer';
import { toUrl } from 'src/core/helpers/file.helper';
import { Product } from 'src/infrastructure/entities/product/product.entity';

export class CartProductRespone {
  readonly product: any;
  section_id: string;
  quantity: number;
  price: number;
  unit: string;
  product_id: string;

  additional_services: any;
  constructor(data: any) {
   
    return {
      id: data.id,
      product_id: data.product.product_sub_category.product.id,
      name: data.product.product_sub_category.product.name,
      section_id:
        data.product.product_sub_category.category_subCategory.section_category
          .section_id,
      description: data.product.product_sub_category.product.description,
      price: data.price,
      quantity: data.quantity,
      unit: data.product.product_measurement.measurement_unit.name,
      unit_id:data.product.product_measurement.id,
      is_recovered: data.product.is_recovered,
      min_order_quantity: data.product.product_offer
        ? data.product.product_offer.min_offer_quantity
        : data.product.min_order_quantity,
      max_order_quantity: data.product.product_offer
        ? data.product.product_offer.min_offer_quantity
        : data.product.max_order_quantity,

      additional_services: data.product.product_additional_services.filter(
        (e) => {
          if (data.additional_services.includes(e.id)) {
            e.additional_service.id = e.id;
            return e.additional_service;
          }
        },
      ),
      image: toUrl(
        data.product.product_sub_category.product.product_images.find(
          (e) => e.is_logo,
        ).url,
      ),
    } as any;
  }
}
