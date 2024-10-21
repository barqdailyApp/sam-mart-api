import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { ProductImage } from './product-image.entity';
import { Product } from './product.entity';
import { ProductMeasurement } from './product-measurement.entity';
import { ShipmentProduct } from '../order/shipment-product.entity';
import { ShipmentProductHistory } from '../order/shipment-product-history.entity';

@Entity()
export class MeasurementUnit extends AuditableEntity {
  @Column()
  name_ar: string;

  @Column()
  name_en: string;

  @OneToMany(
    () => ProductMeasurement,
    (productMeasurement) => productMeasurement.measurement_unit,
  )
  product_measurements: ProductMeasurement[];

  @OneToMany(
    () => ShipmentProduct,
    (shipmentProduct) => shipmentProduct.main_measurement_unit,
  )
  shipment_products: ShipmentProduct[];

}
