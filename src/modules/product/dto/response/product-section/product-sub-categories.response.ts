import { Exclude, Expose, Transform, plainToClass } from 'class-transformer';
import { CategorySubCategoryResponse } from './category-sub-category.response';

@Exclude()
export class ProductSubCategoryResponse {
  @Expose() category_sub_category_id: string;
  @Expose() product_id: string;
  @Expose() order_by: number;
  @Expose() is_active: boolean;

  @Transform(({ value }) => plainToClass(CategorySubCategoryResponse, value))
  @Expose()
  readonly category_subCategory: CategorySubCategoryResponse;
}
