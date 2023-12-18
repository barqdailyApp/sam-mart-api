import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Order } from '../order/order.entity';
import { Service } from './service.entity';
import { Gift } from '../gift/gift.entity';
import { OwnedEntity } from 'src/infrastructure/base/owned.entity';
import { User } from '../user/user.entity';
import { PackagesServices } from './packages-services';

@Entity()
export class Package extends AuditableEntity {
  @Column({ unique: true })
  name_ar: string;

  @Column({ unique: true })
  name_en: string;

  @Column({ unique: true })
  order_by: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price_wash_single: number;

  @Column()
  wash_count: number;

  @Column({ nullable: true })
  description_ar: string;

  @Column({ nullable: true })
  description_en: string;

  @Column()
  background_url: string;

  @Column()
  background_url_internal: string;
  
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total_price_package: number;

  //* package expires after thirty days (for example) from the beginning of the reservation
  @Column()
  expiry_date_in_days: number;

  @Column()
  buy_by_points: number;

  @OneToMany(
    () => PackagesServices,
    (package_service) => package_service.package,
  )
  package_service: PackagesServices[];
}
