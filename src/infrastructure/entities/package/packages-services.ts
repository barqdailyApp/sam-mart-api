import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import { Package } from './package.entity';

import { Service } from './service.entity';

@Entity()
export class PackagesServices extends AuditableEntity {
  @ManyToOne(() => Package, (pk) => pk.package_service, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'package_id' })
  package: Package;

  @Column()
  package_id: string;

  @ManyToOne(() => Service, (sr) => sr.package_service, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @Column()
  service_id: string;

  @Column()
  service_count: number;

  @Column({ default: true })
  is_active: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total_price_service: number;

  constructor(data: Partial<PackagesServices>) {
    super();
    Object.assign(this, data);
  }
}
