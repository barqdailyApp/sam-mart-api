import { Exclude, Expose, Transform, plainToClass } from 'class-transformer';
import { toUrl } from 'src/core/helpers/file.helper';
import { ProductMeasurement } from 'src/infrastructure/entities/product/product-measurement.entity';
import { MeasurementUnitResponse } from 'src/modules/measurement-unit/dto/responses/measurement-unit.response';

import { ProductSubCategory } from 'src/infrastructure/entities/product/product-sub-category.entity';
import { CartProduct } from 'src/infrastructure/entities/cart/cart-products';
import { ProductMeasurementResponse } from '../product-measurement.response';
import { ProductImagesResponse } from '../product-images.response';

@Exclude()
export class ProductNewResponse {
  @Expose() readonly id: string;

  @Expose() readonly name_ar: string;

  @Expose() readonly name_en: string;

  @Expose() readonly description_ar: string;

  @Expose() readonly description_en: string;

  @Expose() readonly is_active: boolean;

  @Expose() readonly is_recovered: boolean;

  @Expose()
  @Transform(({ obj }) => {
    return toUrl(obj.product_images.find((x) => x.is_logo === true).url);
  })
  logo: string;

  @Expose()
  @Transform(({ obj }) => {
    if (!Array.isArray(obj.products_favorite)) {
      return false;
    }
    for (let i = 0; i < obj.products_favorite.length; i++) {
      for (let j = 0; j < obj.product_sub_categories.length; j++) {
        if (
          obj.products_favorite[i].section_id ===
          obj.product_sub_categories[j].category_subCategory.section_category
            .section_id
        ) {
          return true;
        }
      }
    }
    return false;
  })
  is_fav: boolean;
  
  @Expose()
  @Transform(({ obj }) => {
    if (!Array.isArray(obj.warehouses_products)) {
      return 0;
    }
    return obj.warehouses_products.reduce((acc, cur) => acc + cur.quantity, 0);
  })
  totalQuantity: number;

  @Transform(({ value }) => plainToClass(ProductMeasurementResponse, value))
  @Expose()
  readonly product_measurements: ProductMeasurementResponse[];

  @Transform(({ value }) => plainToClass(ProductImagesResponse, value))
  @Expose()
  readonly product_images: ProductImagesResponse;

  constructor(data: Partial<ProductNewResponse>) {
    Object.assign(this, data);
  }
}
