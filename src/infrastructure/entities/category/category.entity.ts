import { BaseEntity } from 'src/infrastructure/base/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { Subcategory } from './subcategory.entity';
import { SectionCategory } from '../section/section-category.entity';
import { CategorySubCategory } from './category-subcategory.entity';
import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';

@Entity()
export class Category extends AuditableEntity {
  @Column()
  name_ar: string;
  @Column()
  name_en: string;

  @Column({ nullable: true })
  logo: string;

  @OneToMany(
    () => SectionCategory,
    (sectionCategory) => sectionCategory.category,
  )
  section_categories: SectionCategory[];
  constructor(partial?: Partial<Category>) {
    super();
    Object.assign(this, partial);
  }
}
