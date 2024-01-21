import { Exclude, Expose } from 'class-transformer';
import { DeliveryType } from 'src/infrastructure/data/enums/delivery-type.enum';
import { Role } from 'src/infrastructure/data/enums/role.enum';
@Exclude()
export class SectionResponse {
  @Expose() id: string;
  @Expose() name_ar: string;
  @Expose() name_en: string;
  @Expose() logo: string;
  @Expose() order_by: number;
  @Expose() min_order_price: number;
  @Expose() allowed_roles: Role[];
  @Expose() delivery_price: number;
  @Expose() delivery_type: DeliveryType;
}
