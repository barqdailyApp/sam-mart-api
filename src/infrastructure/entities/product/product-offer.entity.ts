import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { Product } from './product.entity';
import { ProductCategoryPrice } from './product-category-price.entity';
import { DiscountType } from 'src/infrastructure/data/enums/discount-type.enum';

@Entity()
export class ProductOffer extends AuditableEntity {
  @OneToOne(() => ProductCategoryPrice)
  @JoinColumn({ name: 'product_category_price_id' })
  product_category_price: ProductCategoryPrice;

  @Column()
  product_category_price_id: string;

  @Column()
  start_date: Date;

  @Column()
  end_date: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @Column()
  offer_quantity: number;

  @Column()
  min_offer_quantity: number;

  @Column()
  max_offer_quantity: number;

  @Column({ type: 'enum', enum: DiscountType })
  discount_type: DiscountType;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount_value: number;

  @Column()
  is_active: boolean;
}
