import { OwnedEntity } from 'src/infrastructure/base/owned.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { User } from '../user/user.entity';

import { Order } from '../order/order.entity';
import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';

@Entity()
export class ReviewOrder extends AuditableEntity  {
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  rate: number;

  @Column({nullable:true})
  comment: string;



  @OneToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column()
  order_id: string;
}
