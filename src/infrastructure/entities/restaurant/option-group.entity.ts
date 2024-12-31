import { AuditableEntity } from "src/infrastructure/base/auditable.entity"
import { Column, Entity, OneToMany } from "typeorm"
import { Option } from "./option.entity"
import { MealOptionGroup } from "./meal-option-group"
@Entity()
export class OptionGroup extends AuditableEntity {
    
    @Column()
    name_ar: string
    @Column()
    name_en: string
    @Column({default:false})
    is_required: boolean
    @Column({default:false})
    multiple_selection: boolean
    @Column({nullable:true})
    max_selection:number
    @OneToMany(()=>Option,option=>option.option_group)
    options:Option[]
    @OneToMany(()=>MealOptionGroup,mealOptionGroup=>mealOptionGroup.option_group)
    meal_option_groups:MealOptionGroup[]

}