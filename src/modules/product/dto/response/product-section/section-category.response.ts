import { Exclude, Expose, Transform, plainToClass } from 'class-transformer';
import { SectionResponse } from './section.response';
@Exclude()
export class SectionCategoryResponse {
  @Expose() section_id: string;

  @Expose() category_id: string;
  @Expose() order_by: number;
  @Expose() is_active: boolean;

  @Transform(({ value }) => plainToClass(SectionResponse, value))
  @Expose()
  readonly section: SectionResponse;
}
