import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import { User } from '../user/user.entity';
import { City } from '../city/city.entity';

@Entity()
export class WorkingArea extends AuditableEntity {
  @Column({ length: 500 })
  address: string;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  location: string;

  @Column({ type: 'float', precision: 10, scale: 6 })
  latitude: number;

  @Column({ type: 'float', precision: 11, scale: 6 })
  longitude: number;

  @ManyToOne(() => City, (city) => city.WorkingAreas)
  @JoinColumn({ name: 'city_id' })
  city: City;

  @Column()
  city_id: string;


  constructor(partial?: Partial<WorkingArea>) {
    super();
    Object.assign(this, partial);
  }

  @BeforeInsert()
  saveLocation() {
    this.location = `POINT(${this.latitude} ${this.longitude})`;
  }

  @BeforeUpdate()
  updateLocation() {
    this.location = `POINT(${this.latitude} ${this.longitude})`;
  }
}
