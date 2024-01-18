import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { ProductImage } from './product-image.entity';
import { ProductMeasurement } from './product-measurement.entity';
import { ProductSubCategory } from './product-sub-category.entity';
import { WarehouseOperations } from '../warehouse/warehouse-opreations.entity';
import { WarehouseProducts } from '../warehouse/warehouse-products.entity';
import { ProductFavorite } from './product-favorite.entity';

@Entity()
export class Product extends AuditableEntity {
  @Column()
  name_ar: string;

  @Column()
  name_en: string;

  @Column({ type: 'longtext' })
  description_ar: string;

  @Column({ type: 'longtext' })
  description_en: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: false })
  is_recovered: boolean;

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
}
