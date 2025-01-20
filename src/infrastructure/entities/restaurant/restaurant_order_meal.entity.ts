import { Res } from "@nestjs/common";
import { AuditableEntity } from "src/infrastructure/base/auditable.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { RestaurantOrder } from "./restaurant_order.entity";
import { Meal } from "./meal.entity";

@Entity()
export class RestaurantOrderMeal extends AuditableEntity{ 

 @ManyToOne(()=>RestaurantOrder, (order)=>order.restaurant_order_meals)
 @JoinColumn()
  restaurant_order:RestaurantOrder
    
 @Column()
 restaurant_order_id:string

@ManyToOne(()=>Meal)
@JoinColumn()
meal:Meal

 @Column()
 meal_id:string
}