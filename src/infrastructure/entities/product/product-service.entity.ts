import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Product } from './product.entity';
import { ProductMeasurement } from './product-measurement.entity';
import { ProductCategoryPrice } from './product-category-price.entity';
import { AdditionalService } from './additional-service.entity';

@Entity()
export class ProductService extends AuditableEntity {
  @Column()
  url: string;

  @ManyToOne(
    () => ProductCategoryPrice,
    (productCategoryPrice) => productCategoryPrice.product_services,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'product_category_price_id' })
  product_category_price: ProductCategoryPrice;

  @Column()
  product_category_price_id: string;


  @ManyToOne(
    () => AdditionalService,
    (additionalService) => additionalService.product_services,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'additional_service_id' })
  additional_service: AdditionalService;

  @Column()
  additional_service_id: string;


  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;
}
