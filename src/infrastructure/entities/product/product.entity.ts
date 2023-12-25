import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { ProductImage } from './product-image.entity';
import { ProductMeasurement } from './product-measurement.entity';

@Entity()
export class Product extends AuditableEntity {
  @Column()
  name_ar: string;

  @Column()
  name_en: string;

  @Column({ type: 'longtext' })
  description: string;

  @Column()
  logo: string;

  @Column({ nullable: true })
  order_by: number;

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: false })
  is_recovered: boolean;
  

  @OneToMany(() => ProductImage, (productImage) => productImage.product)
  product_images: ProductImage[];

  @OneToMany(
    () => ProductMeasurement,
    (productMeasurement) => productMeasurement.product,
  )
  product_measurements: ProductMeasurement[];
}
