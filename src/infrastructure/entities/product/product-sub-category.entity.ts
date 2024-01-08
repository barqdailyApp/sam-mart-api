import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { ProductImage } from './product-image.entity';
import { Product } from './product.entity';
import { ProductMeasurement } from './product-measurement.entity';
import { Subcategory } from '../category/subcategory.entity';
import { ProductCategoryPrice } from './product-category-price.entity';
import { CategorySubCategory } from '../category/category-subcategory.entity';

@Entity()
export class ProductSubCategory extends AuditableEntity {
  // sub category
  @ManyToOne(
    () => CategorySubCategory,
    (categorySubCategory) => categorySubCategory.product_sub_categories,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'categorySubCategory_id' })
  category_subCategory: CategorySubCategory;

  @Column()
  categorySubCategory_id: string;

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
