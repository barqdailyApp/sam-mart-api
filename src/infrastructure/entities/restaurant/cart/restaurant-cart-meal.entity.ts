import { AuditableEntity } from "src/infrastructure/base/auditable.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { Meal } from "../meal/meal.entity";
import { RestaurantCart } from "./restaurant-cart.entity";
import { RestaurantCartMealOption } from "./restaurant-cart-meal-option.entity";

@Entity()
export class RestaurantCartMeal extends AuditableEntity {
    @ManyToOne(() => RestaurantCart, (cart) => cart.restaurant_cart_meals)
    @JoinColumn()
    cart: RestaurantCart
    @ManyToOne(() => Meal, (meal) => meal.cart_meals)
    @JoinColumn()
    meal: Meal
    @Column({nullable: false})
    cart_id: string
    @Column({nullable: false})
    meal_id: string
    @Column({default:1})
    quantity: number
    @OneToMany(()=>RestaurantCartMealOption,restaurantCartMealOption=>restaurantCartMealOption.cart_meal,{onDelete:"CASCADE"})
    cart_meal_options:RestaurantCartMealOption[]

}