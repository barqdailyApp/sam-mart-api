import { Exclude, Expose, Transform, plainToClass } from 'class-transformer';

import { ProductMeasurementResponse } from './product-measurement.response';
import { ProductImagesResponse } from './product-images.response';
import { ProductResponse } from './product.response';
import { SectionResponse } from './product-section/section.response';
import { UserResponse } from 'src/modules/user/dto/responses/user.response';

@Exclude()
export class ProductFavResponse {
  @Expose() readonly id: string;

  @Transform(({ value }) => plainToClass(ProductResponse, value))
  @Expose()
  readonly product: ProductResponse;

  @Transform(({ value }) => plainToClass(SectionResponse, value))
  @Expose()
  readonly section: SectionResponse;

  @Transform(({ value }) => plainToClass(UserResponse, value))
  @Expose()
  readonly user: UserResponse;

  constructor(data: Partial<ProductFavResponse>) {
    Object.assign(this, data);
  }
}
