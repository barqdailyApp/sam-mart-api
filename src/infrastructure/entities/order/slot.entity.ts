import { BaseEntity } from 'src/infrastructure/base/base.entity';
import { TimeZone } from 'src/infrastructure/data/enums/time-zone.enum';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { Order } from '../order/order.entity';

@Entity()
export class Slot extends BaseEntity {
  @Column()
  start_time: string;

  @Column()
  end_time: string;

  @Column({ enum: TimeZone, type: 'enum' })
  time_zone: TimeZone;

  @Column()
  order_by: number;

  @OneToMany(() => Order, (order) => order.slot)
  orders: Order[];
}
