import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { OptionGroup } from "./option-group.entity";
import { AuditableEntity } from "src/infrastructure/base/auditable.entity";
import { RestaurantCartMealOption } from "../cart/restaurant-cart-meal-option.entity";
@Entity()
export class Option extends AuditableEntity{
    @Column()
    name_ar: string;
    @Column()
    name_en: string;
    @Column({default:0})
   price:number
   @ManyToOne(()=>OptionGroup,optionGroup=>optionGroup.options)
   @JoinColumn({name:"option_group_id"})
   option_group:OptionGroup
   @Column({nullable:true})
   option_group_id:string
   @Column({default:true})
   is_active:boolean
   

   
}