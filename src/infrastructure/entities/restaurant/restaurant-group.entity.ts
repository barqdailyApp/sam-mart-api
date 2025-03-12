import { AuditableEntity } from "src/infrastructure/base/auditable.entity";
import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from "typeorm";
import { Restaurant } from "./restaurant.entity";

@Entity()
export class RestaurantGroup extends AuditableEntity {
 
    
 @Column()
 name_ar:string
   
 @Column()
 name_en:string   
 
 @Column()
 order_by:number

 @Column({nullable:true})
 logo:string



 @Column({ default: true })
 is_active: boolean;

 @ManyToMany(()=>Restaurant,restaurant=>restaurant.groups)
 @JoinTable()
 restaurants:Restaurant[]

}