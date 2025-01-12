import { Expose, plainToInstance, Transform } from "class-transformer";
import { OptionGroup } from "src/infrastructure/entities/restaurant/option-group.entity";

export class OptionRespone{

    @Expose()
    id:string
    @Expose()
    name_ar:string
    @Expose()
    name_en:string
    @Expose()
    price:number

}
export class OptionGroupResponse{

    @Expose()
    id:string
    @Expose()
    name_ar:string
    @Expose()
    name_en:string

    @Expose()
    min_selection:number
    @Expose()
    max_selection:number
   
    @Expose()
    @Transform((value)=>plainToInstance(OptionRespone,value.obj.options,{excludeExtraneousValues:true}))
    options:OptionRespone[]
}

