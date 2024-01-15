import { Column, ManyToOne, JoinColumn, Entity } from 'typeorm';
import { ProductCategoryPrice } from '../product/product-category-price.entity';
import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
@Entity()
export class ShipmentProduct extends AuditableEntity {
  @Column()
  quantity: number;

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
}
