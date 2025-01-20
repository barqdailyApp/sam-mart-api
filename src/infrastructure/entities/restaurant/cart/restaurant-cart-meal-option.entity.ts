import { AuditableEntity } from "src/infrastructure/base/auditable.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { RestaurantCartMeal } from "./restaurant-cart-meal.entity";
import { MealOptionGroup } from "../meal/meal-option-group";
import { Option } from "../option/option.entity";
@Entity()
export class RestaurantCartMealOption  extends AuditableEntity{
@ManyToOne(()=>RestaurantCartMeal, (cart_meal) => cart_meal.cart_meal_options,{onDelete:"CASCADE"})
@JoinColumn({name:"cart_meal_id"})
cart_meal: RestaurantCartMeal
 
@Column({nullable: false})
cart_meal_id: string


@ManyToOne(()=>Option,)
@JoinColumn({name:"option_id"})
option:Option

@Column({nullable:true})
option_id:string

constructor(data: Partial<RestaurantCartMealOption>) {
    super();
    Object.assign(this, data);
}
}