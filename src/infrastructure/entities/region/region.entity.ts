import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { Driver } from '../driver/driver.entity';


@Entity()
export class Region extends AuditableEntity {

  @Column()
  name_ar:string;

  @Column()
  name_en:string;

  
  @OneToMany(() => Driver, (driver) => driver.region)
  drivers: Driver[]
}
