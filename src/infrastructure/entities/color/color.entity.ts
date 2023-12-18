import { Vehicle } from '../vehicle/vehicle.entity';
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { Points } from '../points/point.entity';
import { User } from '../user/user.entity';
import { OwnedEntity } from 'src/infrastructure/base/owned.entity';
import { Gift } from '../gift/gift.entity';
import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
@Entity()
export class Color extends AuditableEntity {
  @Column({ unique: true })
  name_ar: string;

  @Column({ unique: true })
  name_en: string;

  @Column({ unique: true })
  hex: string;

  @OneToMany(() => Vehicle, (vehicle) => vehicle.color)
  vehicles: Vehicle[];


}
