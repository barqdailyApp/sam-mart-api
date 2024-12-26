import { AuditableEntity } from "src/infrastructure/base/auditable.entity";
import { Column, Entity } from "typeorm";
@Entity()
export class Meal extends AuditableEntity{

    @Column()
    name_ar: string;
  
    @Column()
    name_en: string;  
  
    @Column({ type: 'longtext', nullable: true })
    description_ar: string;
  
    @Column({ type: 'longtext', nullable: true })
    description_en: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    price: number;

    @Column({default:true})
    is_active: boolean;
  
    @Column({ nullable: true })
	image: string;

    @Column({default:0})
    meal_order_count :number

    

    



}