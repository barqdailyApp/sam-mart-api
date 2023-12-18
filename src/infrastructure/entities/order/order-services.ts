import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Order } from './order.entity';
import { BaseEntity } from 'src/infrastructure/base/base.entity';

@Entity()
export class OrderServices extends BaseEntity {
  @Column()
  name_ar: string;

  @Column()
  name_en: string;

  @Column({nullable:true})
  finish_time: Date;

  @Column()
  duration_by_minute: number;

  @ManyToOne(() => Order, (order) => order.services)
  @JoinColumn({ name: 'order_id' })
  order: Order;


  @Column()
  service_id:string
  @Column()
  order_id:string
  constructor(data: Partial<OrderServices>) {
    super();
    Object.assign(this, data);
  }
}
