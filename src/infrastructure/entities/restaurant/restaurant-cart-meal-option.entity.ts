import { AuditableEntity } from "src/infrastructure/base/auditable.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { RestaurantCartMeal } from "./restaurant-cart-meal.entity";
import { MealOptionGroup } from "./meal-option-group";

@Entity()
export class RestaurantCartMealOption  extends AuditableEntity{
@ManyToOne(()=>RestaurantCartMeal, (cart_meal) => cart_meal.cart_meal_options)
@JoinColumn({name:"cart_meal_id"})
cart_meal: RestaurantCartMeal
 
@Column({nullable: false})
cart_meal_id: string


@ManyToOne(()=>MealOptionGroup,(meal_option_group)=>meal_option_group.cart_meal_options)
@JoinColumn({name:"meal_option_group_id"})
meal_option_group:MealOptionGroup

@Column({nullable: false})
meal_option_group_id:string


}