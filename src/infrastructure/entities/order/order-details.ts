import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { OrderImage } from './order-image.entity';
import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import { Order } from './order.entity';
import { BaseEntity } from 'src/infrastructure/base/base.entity';
@Entity()
export class OrderDetails extends BaseEntity {
  @OneToOne(() => Order, {})
  @JoinColumn({ name: 'order_id' })
  order: Order;
  @Column()
  order_id: string;
  @Column({ nullable: true })
  estimated_biker_arrival_time: Date;

  @Column({ nullable: true })
  biker_arrival_time: Date;

  @Column({ nullable: true })
  estimated_order_finish_time: Date;

  @Column({ nullable: true })
  order_finish_time: Date;

  @OneToMany(() => OrderImage, (order_image) => order_image.order_details)
  order_images: OrderImage[];

  constructor(data: Partial<OrderDetails>) {
    super();
    Object.assign(this, data);
  }
}
