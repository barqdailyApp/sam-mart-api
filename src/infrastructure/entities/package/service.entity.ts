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
import { Package } from './package.entity';
import { OwnedEntity } from 'src/infrastructure/base/owned.entity';
import { User } from '../user/user.entity';
import { PackagesServices } from './packages-services';

@Entity()
export class Service extends AuditableEntity {
  @Column({ unique: true })
  name_ar: string;

  @Column({ unique: true })
  name_en: string;

  //* The service will take 40:Minute, for example
  @Column()
  duration_by_minute: number;

  //* Price per service
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;


  @OneToMany(
    () => PackagesServices,
    (package_service) => package_service.service,
  )
  package_service: PackagesServices[];
}
