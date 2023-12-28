import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Product } from './product.entity';
import { ProductMeasurement } from './product-measurement.entity';
import { ProductService } from './product-service.entity';

@Entity()
export class ProductCategoryPrice extends AuditableEntity {


  @ManyToOne(
    () => ProductMeasurement,
    (productMeasurement) => productMeasurement.product_prices,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'product_measurement_id' })
  product_measurement: ProductMeasurement;

  @Column()
  product_measurement_id: string;

  //TODO : Make Relation With Product Sub Category

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @Column()
  min_order_quantity: number;

  @Column()
  max_order_quantity: number;

  @OneToMany(
    () => ProductService,
    (productService) => productService.product_category_price,
  )
  product_services: ProductService[];
}
