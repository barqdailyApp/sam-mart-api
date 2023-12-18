import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Order } from '../order/order.entity';
import { Service } from '../package/service.entity';
import { Gift } from '../gift/gift.entity';
import { OwnedEntity } from 'src/infrastructure/base/owned.entity';
import { User } from '../user/user.entity';
import { Subscription } from './subscription.entity';

@Entity()
export class SubscriptionPackageService extends AuditableEntity {
  @ManyToOne(
    () => Subscription,
    (subscription_Package) => subscription_Package.service,
    { onDelete: 'CASCADE' },
  )
  subscription: Subscription;
  @Column()
  subscription_id: string;
  @Column({ nullable: true })
  total_service_count: number;
  @Column()
  service_count: number;
  @Column()
  service_id: string;
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;
  
  @Column()
  name_ar: string;

  @Column()
  name_en: string;

  //* The service will take 40:Minute, for example
  @Column()
  duration_by_minute: number;

  constructor(data: Partial<SubscriptionPackageService>) {
    super();
    Object.assign(this, data);
  }
}
