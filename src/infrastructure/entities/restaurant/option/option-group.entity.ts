import { AuditableEntity } from "src/infrastructure/base/auditable.entity"
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm"
import { Option } from "./option.entity"
import { MealOptionGroup } from "../meal/meal-option-group"
import { Restaurant } from "../restaurant.entity"
@Entity()
export class OptionGroup extends AuditableEntity {
    @Column()
    name_ar: string
    @Column()
    name_en: string
    @Column({default:0})
    min_selection: number
    @Column({nullable:true})
    max_selection:number
    @OneToMany(()=>Option,option=>option.option_group)
    options:Option[]
    @OneToMany(()=>MealOptionGroup,mealOptionGroup=>mealOptionGroup.option_group)
    meal_option_groups:MealOptionGroup[]
    @ManyToOne(()=>Restaurant,restaurant=>restaurant.option_groups)
    @JoinColumn({name:"restaurant_id"})
    restaurant:Restaurant
    @Column({nullable:true})
    restaurant_id:string

}