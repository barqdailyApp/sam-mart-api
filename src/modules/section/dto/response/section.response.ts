import { Exclude, Expose, Transform, plainToClass } from 'class-transformer';
import { DeliveryType } from 'src/infrastructure/data/enums/delivery-type.enum';
import { PaymentMethodEnum } from 'src/infrastructure/data/enums/payment-method';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { Category } from 'src/infrastructure/entities/category/category.entity';
import { User } from 'src/infrastructure/entities/user/user.entity';
import { CategoryResponse } from 'src/modules/category/dto/response/category-response';
import { RegionResponse } from 'src/modules/region/dto/responses/region.response';
import { ProfileResponse } from 'src/modules/user/dto/responses/profile.response';
import { UserResponse } from 'src/modules/user/dto/responses/user.response';

@Exclude()
export class SectionResponse {
  @Expose() readonly id: string;

  @Expose() readonly name_ar: string;
  @Expose() readonly name: string;

  @Expose() readonly name_en: string;

  @Expose() readonly logo: string;

  @Expose() readonly order_by: number;

  @Expose() readonly min_order_price: number;

  @Expose() readonly allowed_roles: Role[];

  @Expose() readonly is_active: boolean;

  @Expose() readonly delivery_price: number;
  
  @Transform(({ value }) => {
    if (
      value?.includes(DeliveryType.FAST) &&
      value?.includes(DeliveryType.SCHEDULED)
    )
      value = 'SCHEDULED&FAST';
    else if (value?.includes(DeliveryType.SCHEDULED)) value = 'SCHEDULED';
    else if (value?.includes(DeliveryType.FAST)) value = 'FAST';
else value ='SCHEDULED&FAST';
    return value;
  })
  @Expose() readonly delivery_type: DeliveryType;
 
  @Expose()
  readonly delivery_type_list: DeliveryType;

  @Expose() 
  
  @Transform(( value ) => {
    return value.obj?.section_categories?.map((category) => {
      return new CategoryResponse(category.category);
    });
  })
  categories:CategoryResponse[];
}
