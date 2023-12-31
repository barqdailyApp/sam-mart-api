import { BaseEntity } from 'src/infrastructure/base/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { Subcategory } from './subcategory.entity';
import { SectionCategory } from '../section/section-category.entity';
import { CategorySubCategory } from './category-subcategory.entity';

@Entity()
export class Category extends BaseEntity {
  @Column()
  name_ar: string;
  @Column()
  name_en: string;


  @Column() 
  logo: string;
  @OneToMany(() => CategorySubCategory, categorySubCategory => categorySubCategory.category)
  category_subCategory: CategorySubCategory[];

  @OneToMany(() => SectionCategory, sectionCategory => sectionCategory.category)
  section_categories: SectionCategory[];
  constructor(partial?: Partial<Category>) {
    super();
    Object.assign(this, partial);
  }
}
