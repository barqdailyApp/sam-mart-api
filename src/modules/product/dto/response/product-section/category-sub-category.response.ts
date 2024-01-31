import { Exclude, Expose, Transform, plainToClass } from 'class-transformer';
import { SectionCategoryResponse } from './section-category.response';

@Exclude()
export class CategorySubCategoryResponse {
  @Expose() id: string;

  @Expose() section_category_id: string;
  @Expose() subcategory_id: string;
  @Expose() order_by: number;
  @Expose() is_active: boolean;

  @Transform(({ value }) => plainToClass(SectionCategoryResponse, value))
  @Expose()
  readonly section_category: SectionCategoryResponse;
}
