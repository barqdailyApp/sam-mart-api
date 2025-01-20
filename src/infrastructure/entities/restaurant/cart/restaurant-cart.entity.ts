import { AuditableEntity } from "src/infrastructure/base/auditable.entity";
import { Entity, OneToMany, OneToOne } from "typeorm";
import { Cart } from "../../cart/cart.entity";
import { OwnedEntity } from "src/infrastructure/base/owned.entity";
import { User } from "../../user/user.entity";
import { RestaurantCartMeal } from "./restaurant-cart-meal.entity";

@Entity()
export class RestaurantCart extends OwnedEntity {
@OneToOne(() => User, )
cart: Cart
@OneToMany(() => RestaurantCartMeal,restaurantCartMeal=>restaurantCartMeal.cart ,{onDelete:"CASCADE"})
restaurant_cart_meals:RestaurantCartMeal[]
    


}