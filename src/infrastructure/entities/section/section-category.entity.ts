import { BaseEntity } from "src/infrastructure/base/base.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { Section } from "./section.entity";
import { Category } from "../category/category.entity";

@Entity()

export class SectionCategory extends BaseEntity{

@ManyToOne(() => Section, section => section.section_categories)
@JoinColumn({ name: 'section_id' })
section: Section
@Column({ name: 'section_id' })
section_id: string

@ManyToOne(() => Category, category => category.section_categories)
@JoinColumn({ name: 'category_id' })
category: Category

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