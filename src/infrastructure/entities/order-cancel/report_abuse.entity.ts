import { OwnedEntity } from 'src/infrastructure/base/owned.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { CancelReasons } from './cancel-reasons.entity';
import { Order } from '../order/order.entity';

@Entity()
export class ReportAbuse extends OwnedEntity {
  @Column({ nullable: true })
  another_reason: string;

 

  @ManyToOne(() => CancelReasons, (cancelReason) => cancelReason.report_abuse, {
    nullable: true,
  })
  @JoinColumn({ name: 'cancel_reason_id' })
  cancel_reason: CancelReasons;
  @Column({ nullable: true })
  cancel_reason_id: string;






  @OneToOne(() => Order, (order) => order.report_abuse)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ nullable: true })
  order_id: string;
}
