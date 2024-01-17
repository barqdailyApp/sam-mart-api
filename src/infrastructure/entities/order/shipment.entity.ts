import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { Driver } from '../driver/driver.entity';
import { Order } from './order.entity';
import { Warehouse } from '../warehouse/warehouse.entity';
import { ShipmentStatus } from './shipment-status.entity';
import { ShipmentProduct } from './shipment-product.entity';

@Entity()
export class Shipment extends AuditableEntity {
  @ManyToOne(() => Driver, (driver) => driver.shipments)
  driver: Driver;
  @Column({ nullable: true })
  driver_id: string;

  @ManyToOne(() => Order, (Order) => Order.shipments)
  order: Order;

  @Column()
  order_id: string;

  @ManyToOne(() => Warehouse, (warehouse) => warehouse.shipments)
  warehouse: Warehouse;

  @Column()
  warehouse_id: string;

  @OneToMany(() => ShipmentStatus, (shipmentStatus) => shipmentStatus.shipment)
  status: ShipmentStatus[];

  @OneToMany(
    () => ShipmentProduct,
    (shipmentProduct) => shipmentProduct.shipment,
  )
  shipment_products: ShipmentProduct[];

  constructor(partial?: Partial<Shipment>) {
    super();
    Object.assign(this, partial);
  }
}
