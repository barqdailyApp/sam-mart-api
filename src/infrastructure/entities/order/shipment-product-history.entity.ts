import {
  Column,
  ManyToOne,
  JoinColumn,
  Entity,
  OneToOne,
  OneToMany,
  Index,
} from 'typeorm';
import { ProductCategoryPrice } from '../product/product-category-price.entity';
import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import { Shipment } from './shipment.entity';
import { ReturnOrderProduct } from './return-order/return-order-product.entity';
import { Product } from '../product/product.entity';
import { ProductMeasurement } from '../product/product-measurement.entity';
import { MeasurementUnit } from '../product/measurement-unit.entity';
import { ShipmentProduct } from './shipment-product.entity';
import { User } from '../user/user.entity';
import { ShipmentProductActionType } from 'src/infrastructure/data/enums/shipment-product-action-type.enum';

@Entity()
export class ShipmentProductHistory extends AuditableEntity {
  @ManyToOne(() => ProductCategoryPrice)
  @JoinColumn({ name: 'product_category_price_id' })
  product_category_price: ProductCategoryPrice;

  @Column()
  product_category_price_id: string;

  @ManyToOne(() => Shipment)
  @JoinColumn({ name: 'shipment_id' })
  shipment: Shipment;

  @Column()
  shipment_id: string;

 
  @Column()
  quantity: number;



  @Column()
  conversion_factor: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;



  @Column({ type: 'simple-array', nullable: true })
  additions: string[];

  @Column({ nullable: true, default: false })
  is_offer: boolean;

  @Column({ type: 'enum', enum: ShipmentProductActionType })
  action_type: ShipmentProductActionType;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'modified_by_id' })
  modified_by: User;

  @Column()
  modified_by_id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_price: number;
}
