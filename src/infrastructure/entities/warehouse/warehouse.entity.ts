import { AuditableEntity } from "src/infrastructure/base/auditable.entity";
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany } from "typeorm";
import { WarehouseOperations } from "./warehouse-opreations.entity";
import { WarehouseProducts } from "./warehouse-products.entity";

@Entity()

export class Warehouse extends AuditableEntity {
@Column()
 name:string   
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


@OneToMany(() => WarehouseOperations, (warehouseOperations) => warehouseOperations.warehouse)
operations:WarehouseOperations[]
    
@OneToMany(() => WarehouseProducts, (warehouseProducts) => warehouseProducts.warehouse)
products:WarehouseProducts[]


@BeforeInsert()
saveLocation() {
  this.location = `POINT(${this.latitude} ${this.longitude})`;
}

@BeforeUpdate()
updateLocation() {
  this.location = `POINT(${this.latitude} ${this.longitude})`;
}}