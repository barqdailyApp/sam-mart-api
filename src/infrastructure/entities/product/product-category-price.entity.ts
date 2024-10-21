import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Product } from './product.entity';
import { ProductMeasurement } from './product-measurement.entity';
import { ProductAdditionalService } from './product-additional-service.entity';
import { ProductSubCategory } from './product-sub-category.entity';
import { ProductOffer } from './product-offer.entity';
import { CartProduct } from '../cart/cart-products';
import { ShipmentProduct } from '../order/shipment-product.entity';
import { ShipmentProductHistory } from '../order/shipment-product-history.entity';

@Entity()
export class ProductCategoryPrice extends AuditableEntity {
  @ManyToOne(
    () => ProductMeasurement,
    (productMeasurement) => productMeasurement.product_category_prices,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'product_measurement_id' })
  product_measurement: ProductMeasurement;

  @Column()
  product_measurement_id: string;

  @ManyToOne(
    () => ProductSubCategory,
    (productSubCategory) => productSubCategory.product_prices,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'product_sub_category_id' })
  product_sub_category: ProductSubCategory;

  @Column()
  product_sub_category_id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @Column()
  min_order_quantity: number;

  @Column()
  max_order_quantity: number;

  @OneToMany(
    () => ProductAdditionalService,
    (productService) => productService.product_category_price,
  )
  product_additional_services: ProductAdditionalService[];

  @OneToOne(
    () => ProductOffer,
    (productOffer) => productOffer.product_category_price,
  )
  product_offer: ProductOffer;

  @OneToMany(
    () => CartProduct,
    (cartProduct) => cartProduct.product_category_price,
  )
  cart_products: CartProduct[];
  @OneToMany(
    () => ShipmentProduct,
    (shipmentProduct) => shipmentProduct.product_category_price,
  )
  shipment_products: ShipmentProduct[];


}
