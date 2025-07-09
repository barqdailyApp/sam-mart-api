import { BaseEntity } from 'src/infrastructure/base/base.entity';
import { TimeZone } from 'src/infrastructure/data/enums/time-zone.enum';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Order } from '../order/order.entity';
import { Expose } from 'class-transformer';
import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';

@Entity()
export class Slot extends AuditableEntity {
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
  @Expose()
  @Column()
  day_of_week: string;

  @Column({ default:true })
  is_active: boolean

  @BeforeUpdate()
  setOrderBy() {
    const dayOrderMap = {
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
    };

    this.order_by = dayOrderMap[this.day_of_week] ?? null;
  }
}
