
import { BeforeInsert, BeforeUpdate, Column, Entity, JoinColumn, ManyToOne } from "typeorm";

import { BaseEntity } from "src/infrastructure/base/base.entity";
import { Expose } from "class-transformer";
import { DriverTypeEnum } from "src/infrastructure/data/enums/driver-type.eum";
import { RestaurantSchedule } from "../restaurant/order/restaurant_schedule.entity";
@Entity()
export class SystemSchedule extends BaseEntity {
  @Expose()
  @Column()
  day_of_week: string;
  @Column()
  @Expose()
  open_time: string;
  @Column()
  @Expose()
  close_time: string;

  @Column({ nullable: true })
  order_by: number;
  
    @Column({ nullable: true })
    type:DriverTypeEnum

  @BeforeInsert()
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

  constructor(partial?: Partial<RestaurantSchedule>) {
    super();
    Object.assign(this, partial);
  }
}