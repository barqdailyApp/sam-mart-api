import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { Driver } from '../driver/driver.entity';
import { City } from '../city/city.entity';

@Entity()
export class Region extends AuditableEntity {
  @Column()
  name_ar: string;

  @Column()
  name_en: string;

  @OneToMany(() => Driver, (driver) => driver.region)
  drivers: Driver[];


  @ManyToOne(() => City, (city) => city.regions,{
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'city_id' })
  city: City;

  @Column()
  city_id: string;
}
