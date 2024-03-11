import { Exclude, Expose, Transform, plainToClass } from 'class-transformer';
import { DeliveryType } from 'src/infrastructure/data/enums/delivery-type.enum';
import { PaymentMethodEnum } from 'src/infrastructure/data/enums/payment-method';
import { User } from 'src/infrastructure/entities/user/user.entity';
import { RegionResponse } from 'src/modules/region/dto/responses/region.response';
import { ProfileResponse } from 'src/modules/user/dto/responses/profile.response';
import { UserResponse } from 'src/modules/user/dto/responses/user.response';

@Exclude()
export class WarehouseResponse {
    
  @Expose() readonly id: string;

  @Expose() readonly name_ar: string;

  @Expose() readonly name_en: string;

  @Expose() readonly latitude: number;

  @Expose() readonly longitude: number;

  @Expose() readonly is_active: boolean;

  @Transform(({ value }) => plainToClass(RegionResponse, value))
  @Expose() readonly region: RegionResponse;

}
