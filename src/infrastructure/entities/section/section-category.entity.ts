import { BaseEntity } from "src/infrastructure/base/base.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, Unique } from "typeorm";
import { Section } from "./section.entity";
import { Category } from "../category/category.entity";
import { CategorySubCategory } from "../category/category-subcategory.entity";
import { AuditableEntity } from "src/infrastructure/base/auditable.entity";

@Entity()
// @Unique(["section_id", "order_by"])
export class SectionCategory extends AuditableEntity{

@ManyToOne(() => Section, section => section.section_categories,{onDelete:"CASCADE"})
@JoinColumn({ name: 'section_id' })
section: Section
@Column({ name: 'section_id' })
section_id: string

@ManyToOne(() => Category, category => category.section_categories,{onDelete:"CASCADE"})
@JoinColumn({ name: 'category_id' })
category: Category

@OneToMany(() => CategorySubCategory, categorySubCategory => categorySubCategory.section_category)
  category_subCategory: CategorySubCategory[];

@Column({ name: 'category_id' })
category_id: string

@Column()
order_by: number;

@Column({default:true})
is_active: boolean

constructor(partial?: Partial<SectionCategory>) {
    super();
    Object.assign(this, partial);
}


}