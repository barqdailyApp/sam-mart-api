import { AuditableEntity } from "src/infrastructure/base/auditable.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { Restaurant } from "../restaurant.entity";
import { RestaurantOrderMeal } from "./restaurant_order_meal.entity";
@Entity()
export class RestaurantOrder extends AuditableEntity {
 
 @Column({unique:true})
 number :string

 @ManyToOne(()=>Restaurant,restaurant=>restaurant.restaurant_orders)
 @JoinColumn()
 restaurant:Restaurant
 @Column({nullable:true})
 restaurant_id :string
 @OneToMany(()=>RestaurantOrderMeal,restaurantOrderMeal=>restaurantOrderMeal.restaurant_order)
 restaurant_order_meals:RestaurantOrderMeal[]
}