import { Exclude, Expose } from 'class-transformer';
import { TimeZone } from 'src/infrastructure/data/enums/time-zone.enum';

@Exclude()
export class SlotResponse {
  @Expose() readonly start_time: string;
  @Expose() readonly end_time: string;
  @Expose() readonly time_zone: TimeZone;
  @Expose() readonly order_by: string;

}
