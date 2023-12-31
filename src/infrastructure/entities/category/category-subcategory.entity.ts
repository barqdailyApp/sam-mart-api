import { Column, Entity, ManyToOne } from "typeorm";
import { Subcategory } from "./subcategory.entity";
import { Category } from "./category.entity";
import { BaseEntity } from "src/infrastructure/base/base.entity";

@Entity()

export class CategorySubCategory extends BaseEntity{
    @ManyToOne(() => Category, category => category.category_subCategory)
    category: Category

    @Column({ name: 'category_id' })
    category_id: string

    @ManyToOne(() => Subcategory, subcategory => subcategory.category_subCategory)  
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