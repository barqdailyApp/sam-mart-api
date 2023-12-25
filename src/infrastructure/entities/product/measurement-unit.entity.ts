import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { ProductImage } from './product-image.entity';
import { Product } from './product.entity';
import { ProductMeasurement } from './product-measurement.entity';

@Entity()
export class MeasurementUnit extends AuditableEntity {
  @Column()
  name_ar: string;

  @Column()
  name_en: string;

  @Column()
  abbreviation: string; // KG, L

  @OneToMany(
    () => ProductMeasurement,
    (productMeasurement) => productMeasurement.measurement_unit,
  )
  product_measurements: ProductMeasurement[];
}
