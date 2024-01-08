import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { Subcategory } from "./subcategory.entity";
import { Category } from "./category.entity";
import { BaseEntity } from "src/infrastructure/base/base.entity";
import { SectionCategory } from "../section/section-category.entity";

@Entity()

export class CategorySubCategory extends BaseEntity{
    @ManyToOne(() => SectionCategory, SectionCategory => SectionCategory.category_subCategory,{onDelete:"CASCADE"})
    @JoinColumn({ name: 'section_category_id' })
    section_category: SectionCategory

    @Column()
    section_category_id: string

    @ManyToOne(() => Subcategory, subcategory => subcategory.category_subCategory)  
    @JoinColumn({ name: 'subcategory_id' })
    subcategory: Subcategory

    @Column({ name: 'subcategory_id' })
    subcategory_id: string

    @Column()
    order_by: number;
    @Column({default:true})
    is_active: boolean;


    constructor(partial?: Partial<CategorySubCategory>) {
        super();
        Object.assign(this, partial);
    }
}