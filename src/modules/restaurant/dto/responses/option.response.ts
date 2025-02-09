import { Expose, plainToInstance, Transform } from "class-transformer";
import { OptionGroup } from "src/infrastructure/entities/restaurant/option/option-group.entity";

export class OptionRespone{

    @Expose()
    id:string
    @Expose()
    name_ar:string
    @Expose()
    name_en:string
    @Expose()
    price:number
    @Expose()
    is_active:boolean
    @Expose()
    is_selected:boolean

}
export class OptionGroupResponse{

    @Expose()
    id:string
    @Expose()
    option_group_id:string
    @Expose()
    name_ar:string
    @Expose()
    name_en:string

    @Expose()
    min_selection:number
    @Expose()
    max_selection:number

    @Expose()
    order_by:number
    @Expose()
    is_active:boolean
   
    @Expose()
    @Transform((value)=>plainToInstance(OptionRespone,value.obj.options,{excludeExtraneousValues:true}))
    options:OptionRespone[]
}

