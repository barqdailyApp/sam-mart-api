import { Exclude, Expose, Transform, plainToClass } from 'class-transformer';
import { DeliveryType } from 'src/infrastructure/data/enums/delivery-type.enum';
import { PaymentMethod } from 'src/infrastructure/data/enums/payment-method';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { User } from 'src/infrastructure/entities/user/user.entity';
import { RegionResponse } from 'src/modules/region/dto/responses/region.response';
import { ProfileResponse } from 'src/modules/user/dto/responses/profile.response';
import { UserResponse } from 'src/modules/user/dto/responses/user.response';

@Exclude()
export class SectionResponse {
    
  @Expose() readonly id: string;

  @Expose() readonly  name_ar: string;

  @Expose() readonly  name_en: string;

  @Expose() readonly logo: string;

  @Expose() readonly  order_by: number;

  @Expose() readonly  min_order_price: number;

  @Expose() readonly  allowed_roles: Role[];

  @Expose() readonly  is_active: boolean;

  @Expose() readonly delivery_price: number;

  @Expose() readonly delivery_type: DeliveryType;

}
