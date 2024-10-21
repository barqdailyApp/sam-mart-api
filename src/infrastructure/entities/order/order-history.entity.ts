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
import { Warehouse } from '../warehouse/warehouse.entity';
import { Address } from '../user/address.entity';
import { PromoCode } from '../promo-code/promo-code.entity';
import { Section } from '../section/section.entity';
import { PaymentMethodEnum } from 'src/infrastructure/data/enums/payment-method';
import { DeliveryType } from 'src/infrastructure/data/enums/delivery-type.enum';
import { Slot } from './slot.entity';
import { PaymentMethod } from '../payment_method/payment_method.entity';
import { Order } from './order.entity';

@Entity()
export class OrderHistory extends AuditableEntity {
  @ManyToOne(() => Order, (order) => order.order_histories)
  @JoinColumn()
  order: Order;

  @Column()
  order_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'modified_by_id' })
  modified_by: User;

  @Column()
  modified_by_id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  delivery_fee: number;
}
