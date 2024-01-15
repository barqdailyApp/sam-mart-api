import { Expose } from 'class-transformer';
import { Product } from 'src/infrastructure/entities/product/product.entity';

export class CartProductRespone {
  readonly product: any;
  section_id: string;
  quantity: number;
  total_price: number;
  unit: string;
  constructor(data: any) {
   return {
      id: data.product.id,

      name: data.product.product_sub_category.product.name,
      section_id:
        data.product.product_sub_category.category_subCategory.section_category
          .section_id,
      description: data.product.product_sub_category.product.description,
      total_price: data.total_price,
      quantity: data.quantity,
      unit: data.product.product_measurement.measurement_unit.name,
      is_recovered: data.product.is_recovered,
      image: data.product.product_sub_category.product.product_images.find(
        (e) => e.is_logo,
      ),
    } as any;
  }
}
