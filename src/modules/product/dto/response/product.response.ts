import { Exclude, Expose, Transform, plainToClass } from 'class-transformer';
import { toUrl } from 'src/core/helpers/file.helper';
import { ProductMeasurement } from 'src/infrastructure/entities/product/product-measurement.entity';
import { MeasurementUnitResponse } from 'src/modules/measurement-unit/dto/responses/measurement-unit.response';
import { ProductMeasurementResponse } from './product-measurement.response';
import { ProductImagesResponse } from './product-images.response';
import { ProductWarehouseResponse } from './product-warehouse.response';
import { SectionCategoryResponse } from './section-category.respnse';
import { ProductSubCategory } from 'src/infrastructure/entities/product/product-sub-category.entity';

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


  @Expose()
  readonly product_sub_categories: ProductSubCategory[];

  @Expose()
  totalQuantity: number;

  @Transform(({ value }) => {
    return plainToClass(ProductWarehouseResponse, value);
  })
  @Expose()
  readonly warehouses_products: ProductWarehouseResponse[];

  @Transform(({ value }) => plainToClass(ProductMeasurementResponse, value))
  @Expose()
  readonly product_measurements: ProductMeasurementResponse;

  @Transform(({ value }) => plainToClass(ProductImagesResponse, value))
  @Expose()
  readonly product_images: ProductImagesResponse;
}
