import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { User } from '../user/user.entity';
import { City } from '../city/city.entity';
import { Driver } from '../driver/driver.entity';
import { Employee } from '../employee/employee.entity';

@Entity()
export class Country extends AuditableEntity {

  @Column()
  name_ar: string;

  @Column()
  name_en: string;

  @OneToMany(() => City, (city) => city.country)
  cities: City[]

  @OneToMany(() => Driver, (driver) => driver.country)
  drivers: Driver[]

  @OneToMany(() => Employee, (employee) => employee.country)
  employees: Employee[]
}
