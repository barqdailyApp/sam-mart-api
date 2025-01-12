import { AuditableEntity } from "src/infrastructure/base/auditable.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { OptionGroup } from "./option-group.entity";
import { Meal } from "./meal.entity";
import { RestaurantCartMealOption } from "./restaurant-cart-meal-option.entity";
@Entity()
export class MealOptionGroup extends AuditableEntity {
   @ManyToOne(()=>OptionGroup,optionGroup=>optionGroup.meal_option_groups)
   @JoinColumn({name:"option_group_id"})
   option_group:OptionGroup

   @ManyToOne(()=>Meal,meal=>meal.meal_option_groups)
   @JoinColumn({name:"meal_id"})
   meal:Meal

   @Column({nullable:true})
   option_group_id:string

   @Column({nullable:true})
   meal_id:string

   @Column({default:1})
   order_by:number

   @Column({default:true})
   is_active:boolean
   
@OneToMany(()=>RestaurantCartMealOption,restaurantCartMealOption=>restaurantCartMealOption.meal_option_group)
   cart_meal_options:RestaurantCartMealOption[]

}