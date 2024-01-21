import { Expose } from 'class-transformer';
import { toUrl } from 'src/core/helpers/file.helper';
import { Product } from 'src/infrastructure/entities/product/product.entity';

export class CartProductRespone {
  readonly product: any;
  section_id: string;
  quantity: number;
  price: number;
  unit: string;
  additional_services: any;
  constructor(data: any) {
    console.log(data.ad);
    return {
      id: data.product.id,

      name: data.product.product_sub_category.product.name,
      section_id:
        data.product.product_sub_category.category_subCategory.section_category
          .section_id,
      description: data.product.product_sub_category.product.description,
      price: data.price,
      quantity: data.quantity,
      unit: data.product.product_measurement.measurement_unit.name,
      is_recovered: data.product.is_recovered,

      additional_services: data.product.product_additional_services.map((e) => {
        if (data.additional_services.includes(e.id))
          return e.additional_service;
      }),
      image: toUrl(
        data.product.product_sub_category.product.product_images.find(
          (e) => e.is_logo,
        ).url,
      ),
    } as any;
  }
}
