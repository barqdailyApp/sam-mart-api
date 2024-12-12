import { Exclude, Expose, Transform, plainToClass } from 'class-transformer';
import { toUrl } from 'src/core/helpers/file.helper';
import { ProductMeasurement } from 'src/infrastructure/entities/product/product-measurement.entity';
import { MeasurementUnitResponse } from 'src/modules/measurement-unit/dto/responses/measurement-unit.response';
import { ProductMeasurementResponse } from './product-measurement.response';
import { ProductImagesResponse } from './product-images.response';
import { ProductWarehouseResponse } from './product-warehouse.response';
import { ProductSubCategory } from 'src/infrastructure/entities/product/product-sub-category.entity';
import { ProductSubCategoryResponse } from './product-section/product-sub-categories.response';
import { CartProduct } from 'src/infrastructure/entities/cart/cart-products';

@Exclude()
export class ProductResponse {
  @Expose() readonly id: string;

  @Expose() readonly name_ar: string;

  @Expose() readonly name_en: string;

  @Expose() readonly description_ar: string;

  @Expose() readonly description_en: string;

  @Expose() readonly is_active: boolean;

  
  @Expose() readonly barcode: number;

  @Expose() readonly is_recovered: boolean;

  @Expose() readonly created_at: Date;

  @Expose() readonly updated_at: Date;

  @Expose() readonly deleted_at: Date;

  @Transform(({ value }) => plainToClass(ProductSubCategoryResponse, value))
  @Expose()
  product_sub_categories: ProductSubCategoryResponse[];

  @Expose()
  @Transform(({ obj }) => {
    if (!Array.isArray(obj.warehouses_products)) {
      return 0;
    }
    return obj.warehouses_products?.reduce((acc, cur) => acc + cur.quantity, 0);
  })
  totalQuantity: number ;

  @Expose()
  @Transform(({ obj }) => {
    if (!Array.isArray(obj.products_favorite)) {
      return false;
    }
    for (let i = 0; i < obj.products_favorite?.length; i++) {
      for (let j = 0; j < obj.product_sub_categories?.length; j++) {
        if (
          obj.products_favorite[i]?.section_id ===
          obj.product_sub_categories[j]?.category_subCategory?.section_category
            ?.section_id
        ) {
          return true;
        }
      }
    }
    return false;
  })
  is_fav: boolean;
  @Expose()
  keywords: string[];

  @Transform(({ value }) => plainToClass(ProductMeasurementResponse, value))
  @Expose()
  readonly product_measurements: ProductMeasurementResponse[];

  @Transform(({ value }) => plainToClass(ProductImagesResponse, value))
  @Expose()
  readonly product_images: ProductImagesResponse;

  constructor(data: Partial<ProductResponse>) {
    Object.assign(this, data);
  }
}
