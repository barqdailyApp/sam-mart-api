import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { ProductImage } from './product-image.entity';
import { Product } from './product.entity';
import { MeasurementUnit } from './measurement-unit.entity';
import { ProductCategoryPrice } from './product-category-price.entity';

@Entity()
export class ProductMeasurement extends AuditableEntity {
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  conversion_factor: number;

  @ManyToOne(() => Product, (product) => product.product_measurements, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column()
  product_id: string;

  @ManyToOne(
    () => MeasurementUnit,
    (measurementUnits) => measurementUnits.product_measurements,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'measurement_unit_id' })
  measurement_unit: MeasurementUnit;

  @Column()
  measurement_unit_id: string;

  //* This is the base unit , the unit that the conversion factor is based on
  @Column({ nullable: true })
  base_unit_id: string;

  @Column({ default: false })
  is_main_unit: boolean;

  @OneToMany(
    () => ProductCategoryPrice,
    (productPrice) => productPrice.product_measurement,
  )
  product_category_prices: ProductCategoryPrice[];
}
