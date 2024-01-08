import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { Subcategory } from './subcategory.entity';
import { CategorySubCategory } from './category-subcategory.entity';

@Entity()
export class MostHitSubcategory extends AuditableEntity {
    @OneToOne(() => CategorySubCategory, subcategory => subcategory.most_hit_subcategory)
    @JoinColumn({ name: 'category_sub_category_id' })
    categorySubCategory: CategorySubCategory;

    @Column()
    category_sub_category_id: string;

    @Column({ default: 0 })
    current_hit: number;
    
    @Column({ default: 0 })
    previous_hit: number;
}
