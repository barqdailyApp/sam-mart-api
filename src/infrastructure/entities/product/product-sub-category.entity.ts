import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { ProductImage } from './product-image.entity';
import { Product } from './product.entity';
import { ProductMeasurement } from './product-measurement.entity';
import { Subcategory } from '../category/subcategory.entity';
import { ProductCategoryPrice } from './product-category-price.entity';

@Entity()
export class ProductSubCategory extends AuditableEntity {
  // sub category
  @ManyToOne(() => Subcategory, (category) => category.product_sub_categories, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sub_category_id' })
  sub_category: Subcategory;

  @Column()
  sub_category_id: string;

  // product
  @ManyToOne(() => Product, (product) => product.product_sub_categories, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column()
  product_id: string;

  @OneToMany(
    () => ProductCategoryPrice,
    (productPrice) => productPrice.product_sub_category,
  )
  product_prices: ProductCategoryPrice[];
}
