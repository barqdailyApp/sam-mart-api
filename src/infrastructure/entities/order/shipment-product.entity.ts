import { Column, ManyToOne, JoinColumn, Entity } from 'typeorm';
import { ProductCategoryPrice } from '../product/product-category-price.entity';
import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import { Shipment } from './shipment.entity';
@Entity()
export class ShipmentProduct extends AuditableEntity {
  @ManyToOne(() => Shipment, (shipment) => shipment.shipment_products)
  shipment: Shipment;

  @Column()
  shipment_id: string;

  @Column()
  product_id: string;
  @Column({ nullable: true })
  section_id: string;
  @Column()
  quantity: number;

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

  @Column()
  product_category_price_id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;
  
  @Column({ type: 'simple-array', nullable: true })
  additions: string[];

  constructor(partial?: Partial<ShipmentProduct>) {
    super();
    Object.assign(this, partial);
  }
}
