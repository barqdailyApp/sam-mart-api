import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class OptionGroupMealRequest {
    @ApiProperty({})
    @IsString()
    id: string

    @ApiProperty()
    @IsNumber()
    order_by: number

    //is_active
    @ApiProperty()
    @IsOptional()
    @IsBoolean()
    is_active: boolean

  
}
export class AddMealOptionGroupsRequest {
  //list of option groups
  @ApiProperty({type: [OptionGroupMealRequest], isArray: true})
  @IsArray()
  option_groups: OptionGroupMealRequest[]

@ApiProperty()
@IsString()
meal_id: string

}