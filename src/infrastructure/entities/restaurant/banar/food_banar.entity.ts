import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from "typeorm";
import { Banar } from "../../banar/banar.entity";
import { Restaurant } from "../restaurant.entity";

@Entity()
export class FoodBanar  extends Banar{

 @ManyToOne(() => Restaurant, )  
 @JoinColumn()
 restaurant: Restaurant
 @Column({nullable:true}) 
 restaurant_id:string  
}