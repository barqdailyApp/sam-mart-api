import { Res } from "@nestjs/common";
import { AuditableEntity } from "src/infrastructure/base/auditable.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { RestaurantCategory } from "./restaurant-category.entity";
import { MealOptionGroup } from "./meal-option-group";
import { RestaurantCart } from "./restaurant-cart.entity";
import { RestaurantCartMeal } from "./restaurant-cart-meal.entity";
@Entity()
export class Meal extends AuditableEntity{

    @Column()
    name_ar: string;
  
    @Column()
    name_en: string;  
  
    @Column({ type: 'longtext', nullable: true })
    description_ar: string;
  
    @Column({ type: 'longtext', nullable: true })
    description_en: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    price: number;

    @Column({default:true})
    is_active: boolean;
  
    @Column({ nullable: true })
	image: string;

    @Column({default:0})
    sales_count :number


    @ManyToOne(()=>RestaurantCategory,restaurantCategory=>restaurantCategory.meals)
    @JoinColumn({name:"restaurant_category_id"})
    restaurant_category:RestaurantCategory

    @Column({nullable:true})
    restaurant_category_id:string

    @OneToMany(()=>MealOptionGroup,mealOptionGroup=>mealOptionGroup.meal)
    meal_option_groups:MealOptionGroup[]

    
    @OneToMany(()=>RestaurantCartMeal,restaurantCartMeal=>restaurantCartMeal.meal)
    cart_meals:RestaurantCartMeal[]
    



}