import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Country } from '../country/country.entity';
import { WorkingArea } from '../working-area/working-area.entity';
import { Region } from '../region/region.entity';

@Entity()
export class City extends AuditableEntity {
  @Column()
  name_ar: string;

  @Column()
  name_en: string;

  @ManyToOne(() => Country, (country) => country.cities,{
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'country_id' })
  country: Country;

  @Column()
  country_id: string;

  @OneToMany(() => WorkingArea, (workingArea) => workingArea.city)
  WorkingAreas: WorkingArea[];

  @OneToMany(() => Region, (region) => region.city)
  regions: Region[];
}
