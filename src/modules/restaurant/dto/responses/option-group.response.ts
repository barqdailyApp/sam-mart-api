import { Expose, plainToInstance, Transform } from "class-transformer"

import { OptionRespone } from "./option.response"

export class OptionGroupResponse{

    @Expose()
    id:string
    @Expose()
    option_group_id:string
    @Expose()
    name:string
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
    apply_offer:boolean
   
    @Expose()
    @Transform((value)=>plainToInstance(OptionRespone,value.obj.options,{excludeExtraneousValues:true}))
    options:OptionRespone[]
}

