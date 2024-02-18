import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Country } from '../country/country.entity';
import { Region } from '../region/region.entity';
import { vehicle_types } from 'src/infrastructure/data/enums/vehicle_type.enum';
import { City } from '../city/city.entity';
import { Shipment } from '../order/shipment.entity';
import { DriverStatus } from 'src/infrastructure/data/enums/driver-status.enum';
import { Warehouse } from '../warehouse/warehouse.entity';
import { ShipmentChat } from '../order/shipment-chat.entity';
import { ShipmentFeedback } from '../order/shipment-feedback.entity';

@Entity()
export class Driver extends AuditableEntity {
  @OneToOne(() => User, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  user_id: string;

  @ManyToOne(() => Country, (country) => country.drivers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'country_id' })
  country: Country;

  @Column()
  country_id: string;

  @Column()
  is_receive_orders: boolean;

  @ManyToOne(() => Warehouse, (warehouse) => warehouse.drivers, {})
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;

  @Column({ nullable: true })
  warehouse_id: string;

  @ManyToOne(() => City, (city) => city.drivers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'city_id' })
  city: City;

  @Column()
  city_id: string;

  @ManyToOne(() => Region, (region) => region.drivers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'region_id' })
  region: Region;

  @Column()
  region_id: string;

  @Column({
    type: 'enum',
    default: DriverStatus.PENDING,
    enum: DriverStatus,
  })
  status: DriverStatus;

  @Column({ nullable: true })
  status_reason: string;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  location: string;

  @Column({ type: 'float', precision: 10, scale: 6, nullable: true })
  latitude: number;

  @Column({ type: 'float', precision: 11, scale: 6, nullable: true })
  longitude: number;

  @Column()
  id_card_number: string;

  @Column()
  id_card_image: string;

  @Column()
  license_number: string;

  @Column()
  license_image: string;

  @Column()
  vehicle_color: string;

  @Column()
  vehicle_model: string;

  @Column({ type: 'enum', enum: vehicle_types })
  vehicle_type: vehicle_types;

  @ManyToOne(() => Shipment, (Shipment) => Shipment.driver)
  shipments: Shipment[];

  @OneToMany(() => ShipmentFeedback, (orderFeedback) => orderFeedback.driver)
  order_feedbacks: ShipmentFeedback[];
  constructor(partial?: Partial<Driver>) {
    super();
    Object.assign(this, partial);
  }

  @BeforeInsert()
  saveLocation() {
    this.location =
      this.latitude == null
        ? null
        : `POINT(${this.latitude} ${this.longitude})`;
  }

  @BeforeUpdate()
  updateLocation() {
    this.location =
      this.latitude == null
        ? null
        : `POINT(${this.latitude} ${this.longitude})`;
  }
}
