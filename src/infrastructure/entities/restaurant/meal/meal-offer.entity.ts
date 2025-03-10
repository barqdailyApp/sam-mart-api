import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { AuditableEntity } from "src/infrastructure/base/auditable.entity";
import { Meal } from "./meal.entity";

@Entity()
export class MealOffer extends AuditableEntity {
    @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 }) 
    discount_percentage: number;

    @Column({ type: 'timestamp' }) 
    start_date: Date;

    @Column({ type: 'timestamp' }) 
    end_date: Date;

    @Column({ default: true }) 
    is_active: boolean;

    @ManyToOne(() => Meal, (meal) => meal.offers, { onDelete: "CASCADE" })
    @JoinColumn({ name: "meal_id" })
    meal: Meal;

    @Column({nullable:true})
    meal_id: string;

    @Column({nullable:true})
    description_ar: string;

    @Column({nullable:true})
    description_en: string;

    @Column({nullable:true})
    order_by: number;
}
