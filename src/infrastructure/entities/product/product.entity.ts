import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { ProductImage } from './product-image.entity';
import { ProductMeasurement } from './product-measurement.entity';
import { ProductSubCategory } from './product-sub-category.entity';
import { WarehouseOperations } from '../warehouse/warehouse-opreations.entity';
import { WarehouseProducts } from '../warehouse/warehouse-products.entity';
import { ProductFavorite } from './product-favorite.entity';
import { ShipmentProduct } from '../order/shipment-product.entity';
import { Brand } from '../brand/brand';
import { WarehouseOpreationProducts } from '../warehouse/wahouse-opreation-products.entity';
import { ShipmentProductHistory } from '../order/shipment-product-history.entity';

@Entity()

export class Product extends AuditableEntity {
  @Column()
  name_ar: string;

  @Column()
  name_en: string;

  @Column({nullable:true})
  order_by_brand:number

  @OneToMany(()=>WarehouseOpreationProducts,warehouseOperationsProducts=>warehouseOperationsProducts.product)
  warehouse_operations_products:WarehouseOpreationProducts[]

  @ManyToOne(()=>Brand,brand=>brand.products)
  @JoinColumn({name:'brand_id'})
  brand:Brand
  @Column({nullable:true})
  brand_id:string

  @Column({ type: 'longtext',nullable: true })
  description_ar: string;

  @Column({ type: 'longtext', nullable: true })
  description_en: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: false })
  is_recovered: boolean;

  @Index()
  @Column({ nullable: true })
  barcode: string

  @Index()
  @Column({ nullable: true })
  row_number: number


  @Column({nullable:true,type:'simple-array'})
  keywords: string[]

  @OneToMany(() => ProductImage, (productImage) => productImage.product)
  product_images: ProductImage[];

  @OneToMany(
    () => ProductSubCategory,
    (productSubCategory) => productSubCategory.product,
  )
  product_sub_categories: ProductSubCategory[];

  @OneToMany(
    () => ProductMeasurement,
    (productMeasurement) => productMeasurement.product,
  )
  product_measurements: ProductMeasurement[];

  @OneToMany(
    () => WarehouseProducts,
    (warehouseProducts) => warehouseProducts.product,
  )
  warehouses_products: WarehouseProducts[];

  @OneToMany(
    () => ProductFavorite,
    (productFavorite) => productFavorite.product,
  )
  products_favorite: ProductFavorite[];

  @OneToMany(
    () => ShipmentProduct,
    shipmentProduct => shipmentProduct.product
  )
  shipment_products: ShipmentProduct[];


}
