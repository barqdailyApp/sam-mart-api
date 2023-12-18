import { Expose, plainToInstance } from 'class-transformer';

export class SlotResponse {
  @Expose()
  id: string;
  @Expose()
  start_time: number;
  @Expose()
  end_time: number;
  @Expose()
  name: string;

  @Expose()
  order_by:number;

  @Expose()
  is_active?: boolean;

  constructor(data: Partial<SlotResponse>) {
    this.id = data.id;
    this.start_time = data.start_time;
    this.end_time = data.end_time;
    this.name = data.name;
    this.order_by = data.order_by;

    this.is_active = data.is_active;
  }
}
