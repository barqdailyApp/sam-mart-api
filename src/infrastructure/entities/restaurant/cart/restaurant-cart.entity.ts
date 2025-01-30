import { AuditableEntity } from "src/infrastructure/base/auditable.entity";
import { Column, Entity, ManyToOne, OneToMany, OneToOne } from "typeorm";
import { Cart } from "../../cart/cart.entity";
import { OwnedEntity } from "src/infrastructure/base/owned.entity";
import { User } from "../../user/user.entity";
import { RestaurantCartMeal } from "./restaurant-cart-meal.entity";
import { Restaurant } from "../restaurant.entity";

@Entity()
export class RestaurantCart extends OwnedEntity {
@ManyToOne(() => User )
user: User
@OneToMany(() => RestaurantCartMeal,restaurantCartMeal=>restaurantCartMeal.cart ,{onDelete:"CASCADE"})
restaurant_cart_meals:RestaurantCartMeal[]
    
@ManyToOne(() => Restaurant, )
restaurant: Restaurant

@Column({nullable:true})
restaurant_id:string

}