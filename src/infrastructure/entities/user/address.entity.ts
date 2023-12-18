import { Factory } from 'nestjs-seeder';
import { OwnedEntity } from 'src/infrastructure/base/owned.entity';
import { User } from 'src/infrastructure/entities/user/user.entity';
import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
  OneToMany,
} from 'typeorm';

@Entity('addresses')
export class Address extends OwnedEntity {
  // address name e.g. home, work, etc.
  @Column({ length: 100 })
  name: string;

  // address
  @Column({ length: 500 })
  address: string;

  // geometry column
  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  location: string;

  // latitude
  @Column({ type: 'float', precision: 10, scale: 6 })
  latitude: number;

  // longitude
  @Column({ type: 'float', precision: 11, scale: 6 })
  longitude: number;

  @Column({ default: false })
  is_favorite: boolean;

  constructor(partial?: Partial<Address>) {
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
