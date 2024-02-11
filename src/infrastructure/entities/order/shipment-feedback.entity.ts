import { BaseEntity } from 'src/infrastructure/base/base.entity';
import { TimeZone } from 'src/infrastructure/data/enums/time-zone.enum';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Order } from './order.entity';
import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import { User } from '../user/user.entity';
import { Driver } from '../driver/driver.entity';
import { Shipment } from './shipment.entity';

@Entity()
export class ShipmentFeedback extends AuditableEntity {
  @ManyToOne(() => User, (user) => user.order_feedbacks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ nullable: true })
  user_id: string;

  @ManyToOne(() => Driver, (driver) => driver.order_feedbacks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'driver_id' })
  driver: Driver;

  @Column({ nullable: true })
  driver_id: string;

  @OneToOne(() => Shipment, (shipment) => shipment.order_feedback, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'shipment_id' })
  shipment: Shipment;

  @Column()
  shipment_id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  delivery_time: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  packaging: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  communication: number;
}
