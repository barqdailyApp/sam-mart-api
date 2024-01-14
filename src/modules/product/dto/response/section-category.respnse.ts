import { Exclude, Expose } from 'class-transformer';
import { Subcategory } from 'src/infrastructure/entities/category/subcategory.entity';
import { SectionCategory } from 'src/infrastructure/entities/section/section-category.entity';

@Exclude()
export class SectionCategoryResponse {
  @Expose() readonly id: string;

  @Expose() readonly category_subCategory: Subcategory;
}
