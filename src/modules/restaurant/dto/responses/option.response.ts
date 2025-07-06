import { Expose, plainToInstance, Transform, Type } from 'class-transformer';
import { OptionGroup } from 'src/infrastructure/entities/restaurant/option/option-group.entity';
import { OptionGroupResponse } from './option-group.response';

export class OptionRespone {
  @Expose()
  id: string;
  @Expose()
  option_id: string;
  @Expose()
  name: string;
  @Expose()
  name_ar: string;
  @Expose()
  has_offer: boolean;
  @Expose()
  name_en: string;
  @Expose()
  default_price: number;
  @Expose()
  price: number;
  @Expose()
  is_default: boolean;
  @Expose()
  order_by: number;

  @Expose()
  final_price: number;
  @Expose()
  is_active: boolean;
  @Expose()
  is_selected: boolean;
  @Expose()
  @Type(() => OptionGroupResponse)
  option_group: OptionGroupResponse;
}
