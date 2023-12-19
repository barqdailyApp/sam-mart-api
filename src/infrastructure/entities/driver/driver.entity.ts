import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import { BeforeInsert, BeforeUpdate, Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { User } from '../user/user.entity';
import { Country } from '../country/country.entity';
import { Region } from '../region/region.entity';
import { vehicle_types } from 'src/infrastructure/data/enums/vehicle_type.enum';

@Entity()
export class Driver extends AuditableEntity {
  @OneToOne(() => User,{
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  user_id:string;

  @ManyToOne(() => Country, (country) => country.drivers,{
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'country_id' })
  country: Country;

  @Column()
  country_id: string;

  @ManyToOne(() => Region, (region) => region.drivers,{
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'region_id' })
  region: Region;

  @Column()
  region_id: string;

  @Column({ default: false })
  is_verified:boolean;


  @Column({ length: 500 ,nullable: true, })
  address: string;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  location: string;

  @Column({ type: 'float', precision: 10, scale: 6,nullable: true, })
  latitude: number;

  @Column({ type: 'float', precision: 11, scale: 6,nullable: true, })
  longitude: number;

  @Column()
  id_card_number: string;

  @Column()
  id_card_image:string;

  @Column()
  license_number:string;

  @Column()
  license_image:string;

  @Column()
  vehicle_color:string;

  @Column()
  vehicle_model:string;

  @Column({  type: 'enum', enum: vehicle_types })
  vehicle_type:vehicle_types
  
  constructor(partial?: Partial<Driver>) {
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
