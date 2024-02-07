import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import { Column, Entity, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { Driver } from '../driver/driver.entity';
import { Order } from './order.entity';
import { Warehouse } from '../warehouse/warehouse.entity';
import { ShipmentProduct } from './shipment-product.entity';
import { ShipmentStatusEnum } from 'src/infrastructure/data/enums/shipment_status.enum';
import { ShipmentChat } from './shipment-chat.entity';

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
  @Column({ default: ShipmentStatusEnum.PENDING })
  status: ShipmentStatusEnum;
  @Column({ nullable: true })
  order_confirmed_at: Date;

  @Column({ nullable: true })
  order_on_processed_at: Date;

  @Column({ nullable: true })
  order_shipped_at: Date;

  @Column({ nullable: true })
  order_delivered_at: Date;

  @OneToMany(
    () => ShipmentProduct,
    (shipmentProduct) => shipmentProduct.shipment,
  )
  shipment_products: ShipmentProduct[];

  @OneToMany(() => ShipmentChat, shipmentChat => shipmentChat.shipment, { cascade: true })
  shipment_chats: ShipmentChat[]

  constructor(partial?: Partial<Shipment>) {
    super();
    Object.assign(this, partial);
  }
}
