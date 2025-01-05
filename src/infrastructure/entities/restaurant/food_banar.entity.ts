import { Column, Entity, OneToOne } from "typeorm";
import { Banar } from "../banar/banar.entity";
import { Restaurant } from "./restaurant.entity";
@Entity()
export class FoodBanar  extends Banar{

 @OneToOne(() => Restaurant)   
 @Column({nullable:true}) 
 restaurant_id:string  
}