import {
  Column,
  ManyToOne,
  JoinColumn,
  Entity,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { ProductCategoryPrice } from '../product/product-category-price.entity';
import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import { Shipment } from './shipment.entity';
import { ReturnOrderProduct } from './return-order/return-order-product.entity';
import { Product } from '../product/product.entity';
import { ProductMeasurement } from '../product/product-measurement.entity';
import { MeasurementUnit } from '../product/measurement-unit.entity';
@Entity()
export class ShipmentProduct extends AuditableEntity {
  @ManyToOne(() => Shipment, (shipment) => shipment.shipment_products)
  shipment: Shipment;

  @Column()
  shipment_id: string;

  @ManyToOne(() => Product, (product) => product.shipment_products)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column()
  product_id: string;

  @Column({ default: true })
  is_recovered: boolean;

  @Column({ nullable: true })
  section_id: string;
  @Column()
  quantity: number;

  @ManyToOne(
    () => MeasurementUnit,
    (measurementUnit) => measurementUnit.shipment_products,
  )
  @JoinColumn({ name: 'main_measurement_id' })
  main_measurement_unit: MeasurementUnit;

  @Column()
  main_measurement_id: string;

  @Column()
  conversion_factor: number;

  @ManyToOne(
    () => ProductCategoryPrice,
    (productCategoryPrice) => productCategoryPrice.shipment_products,
  )
  @JoinColumn()
  product_category_price: ProductCategoryPrice;

  @OneToOne(
    () => ReturnOrderProduct,
    (returnOrderProduct) => returnOrderProduct.shipmentProduct,
    { cascade: true },
  )
  returnOrderProduct: ReturnOrderProduct[];

  @Column()
  product_category_price_id: string;

  @Column({ nullable: true, default: false })
  is_offer: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  // to check if the product can be asked for return or not
  @Column({ type: 'boolean', default: true })
  can_return: boolean;

  @Column({ type: 'simple-array', nullable: true })
  additions: string[];

  constructor(partial?: Partial<ShipmentProduct>) {
    super();
    Object.assign(this, partial);
  }
}
