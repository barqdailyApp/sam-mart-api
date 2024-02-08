import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  OneToMany,
  Unique,
} from 'typeorm';
import { Subcategory } from './subcategory.entity';
import { Category } from './category.entity';
import { BaseEntity } from 'src/infrastructure/base/base.entity';
import { SectionCategory } from '../section/section-category.entity';
import { MostHitSubcategory } from './most-hit-subcategory.entity';
import { ProductSubCategory } from '../product/product-sub-category.entity';

@Entity()
// @Unique(["section_category_id", "order_by"])
export class CategorySubCategory extends BaseEntity {
  @ManyToOne(
    () => SectionCategory,
    (SectionCategory) => SectionCategory.category_subCategory,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'section_category_id' })
  section_category: SectionCategory;

  @Column()
  section_category_id: string;

  @ManyToOne(
    () => Subcategory,
    (subcategory) => subcategory.category_subCategory,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'subcategory_id' })
  subcategory: Subcategory;

  @Column({ name: 'subcategory_id' })
  subcategory_id: string;

  @OneToOne(
    () => MostHitSubcategory,
    (most_hit_subcategory) => most_hit_subcategory.categorySubCategory,
  )
  most_hit_subcategory: MostHitSubcategory;

  @Column()
  order_by: number;
  @Column({ default: true })
  is_active: boolean;

  @OneToMany(
    () => ProductSubCategory,
    (productSubCategory) => productSubCategory.category_subCategory,
  )
  product_sub_categories: ProductSubCategory[];

  constructor(partial?: Partial<CategorySubCategory>) {
    super();
    Object.assign(this, partial);
  }
}
