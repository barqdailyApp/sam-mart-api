import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { WarehouseOperations } from './warehouse-opreations.entity';
import { WarehouseProducts } from './warehouse-products.entity';
import { City } from '../city/city.entity';
import { Region } from '../region/region.entity';

import { Order, } from '../order/order.entity';
import { Shipment } from '../order/shipment.entity';

@Entity()
export class Warehouse extends AuditableEntity {
  @Column({ unique: true })
  name_ar: string;

  @Column({ unique: true })
  name_en: string;

  @Column({ default: true })
  is_active: boolean;

  @ManyToOne(() => Region, (region) => region.warehouses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  region: Region;

  @Column({ nullable: true })
  region_id: string;

  @OneToMany(() => Order, (order) => order.warehouse)
  orders: Order[];

  @OneToMany(() => Shipment, (shipment) => shipment.warehouse)
  shipments: Shipment[];

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

  @OneToMany(
    () => WarehouseOperations,
    (warehouseOperations) => warehouseOperations.warehouse,
  )
  operations: WarehouseOperations[];

  @OneToMany(
    () => WarehouseProducts,
    (warehouseProducts) => warehouseProducts.warehouse,
  )
  products: WarehouseProducts[];

  @BeforeInsert()
  saveLocation() {
    this.location = `POINT(${this.latitude} ${this.longitude})`;
  }

  @BeforeUpdate()
  updateLocation() {
    this.location = `POINT(${this.latitude} ${this.longitude})`;
  }
}
