import { Expose } from 'class-transformer';
import { Product } from 'src/infrastructure/entities/product/product.entity';

export class CartProductRespone {
  readonly product: any;
  section_id: string;
  quantity: number;
  total_price: number;
  unit: string;
  constructor(data: Partial<CartProductRespone>) {
    this.product = {
      id: data.product.id,

      name: data.product.name,
      section_id: data.section_id,

      description: data.product.description,
      total_price: data.total_price,
      quantity: data.quantity,
      unit: data.unit,
      is_recovered: data.product.is_recovered,
      image: data.product.product_images.find((e) => e.is_logo),
    };
  }
}
