import { BaseEntity } from 'src/infrastructure/base/base.entity';
import { TimeZone } from 'src/infrastructure/data/enums/time-zone.enum';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { Order } from '../order/order.entity';

@Entity()
export class Slot extends BaseEntity {
  @Column()
  start_time: number;

  @Column()
  end_date: number;

  @Column({ enum: TimeZone, type: 'enum' })
  time_zone: TimeZone;


  @OneToMany(() => Order,order=>order.slot)
  orders: Order[]


}
