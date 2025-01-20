import { AuditableEntity } from "src/infrastructure/base/auditable.entity";
import { Entity, JoinColumn, ManyToOne } from "typeorm";
import { RestaurantOrderMeal } from "./restaurant_order_meal.entity";
import { Option } from "../option/option.entity";
@Entity()
export class RestaurantOrderMealOption extends AuditableEntity {
    @ManyToOne(()=>RestaurantOrderMeal, (orderMeal)=>orderMeal.restaurant_order_meal_options)
    @JoinColumn()
    restaurant_order_meal:RestaurantOrderMeal

    @ManyToOne(()=>Option, )
    @JoinColumn()
    option:Option
}