import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Subcategory } from './subcategory.entity';
import { Category } from './category.entity';
import { BaseEntity } from 'src/infrastructure/base/base.entity';
import { SectionCategory } from '../section/section-category.entity';
import { ProductSubCategory } from '../product/product-sub-category.entity';

@Entity()
export class CategorySubCategory extends BaseEntity {
  @ManyToOne(
    () => SectionCategory,
    (SectionCategory) => SectionCategory.category_subCategory,
  )
  section_category: SectionCategory;

  @Column()
  section_category_id: string;

  @ManyToOne(
    () => Subcategory,
    (subcategory) => subcategory.category_subCategory,
  )
  @JoinColumn({ name: 'subcategory_id' })
  subcategory: Subcategory;

  @Column({ name: 'subcategory_id' })
  subcategory_id: string;

  @OneToMany(
    () => ProductSubCategory,
    (productSubCategory) => productSubCategory.category_subCategory,
  )
  product_sub_categories: ProductSubCategory[];

  @Column()
  order_by: number;
  @Column({ default: true })
  is_active: boolean;

  constructor(partial?: Partial<CategorySubCategory>) {
    super();
    Object.assign(this, partial);
  }
}
