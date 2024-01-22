import { Exclude, Expose, Transform, plainToClass } from 'class-transformer';
import { toUrl } from 'src/core/helpers/file.helper';
import { ProductMeasurement } from 'src/infrastructure/entities/product/product-measurement.entity';
import { MeasurementUnitResponse } from 'src/modules/measurement-unit/dto/responses/measurement-unit.response';
import { ProductMeasurementResponse } from './product-measurement.response';
import { ProductImagesResponse } from './product-images.response';
import { ProductWarehouseResponse } from './product-warehouse.response';
import { ProductSubCategory } from 'src/infrastructure/entities/product/product-sub-category.entity';
import { ProductSubCategoryResponse } from './product-section/product-sub-categories.response';

@Exclude()
export class ProductResponse {
  @Expose() readonly id: string;

  @Expose() readonly name_ar: string;

  @Expose() readonly name_en: string;

  @Expose() readonly description_ar: string;

  @Expose() readonly description_en: string;

  @Expose() readonly is_active: boolean;

  @Expose() readonly is_recovered: boolean;

  @Expose() readonly created_at: Date;

  @Expose() readonly updated_at: Date;

  @Transform(({ value }) => {
    if (value === null || value === undefined) {
      return plainToClass(ProductSubCategoryResponse, value);
    }
    return value.length === 1
      ? plainToClass(ProductSubCategoryResponse, value[0])
      : plainToClass(ProductSubCategoryResponse, value);
  })
  @Expose()
  product_sub_categories:
    | ProductSubCategoryResponse[]
    | ProductSubCategoryResponse
    | null;

  @Expose()
  @Transform(({ obj }) => {
    if (!Array.isArray(obj.warehouses_products)) {
      return 0;
    }
    return obj.warehouses_products.reduce((acc, cur) => acc + cur.quantity, 0);
  })
  totalQuantity: number | null;

  @Expose()
  @Transform(({ obj }) => {
    return (
      Array.isArray(obj.products_favorite) && obj.products_favorite.length === 1
    );
  })
  is_fav: boolean;

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
