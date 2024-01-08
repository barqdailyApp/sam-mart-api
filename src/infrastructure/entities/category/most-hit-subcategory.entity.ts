import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { Subcategory } from './subcategory.entity';

@Entity()
export class MostHitSubcategory extends AuditableEntity {
    @OneToOne(() => Subcategory, subcategory => subcategory.most_hit_subcategory)
    @JoinColumn({ name: 'sub_category_id' })
    subcategory: Subcategory;

    @Column()
    sub_category_id: string;

    @Column({ default: 0 })
    current_hit: number;
    
    @Column({ default: 0 })
    previous_hit: number;
}
