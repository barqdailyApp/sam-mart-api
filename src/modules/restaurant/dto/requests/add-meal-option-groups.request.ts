import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";

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

      @ApiProperty()
    @IsOptional()
    @IsBoolean()
    apply_offer: boolean

  
}


export class AddMealOptionPriceRequest {
  @ApiProperty()
  @IsString()
  option_id: string
  @ApiProperty()
  @IsNumber()
  price: number

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  order_by: number

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  is_default: boolean

}
export class UpdateMealOptionPriceRequest{
  @ApiProperty()
  @IsString()
  id: string
  @ApiProperty()
  @IsNumber()
  price: number

    @ApiProperty()
  @IsNumber()
  @IsOptional()
  order_by: number

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  is_default: boolean
}
export class AddMealOptionGroupsRequest {
  //list of option groups
  @ApiProperty({
    type: [OptionGroupMealRequest]
  })

 
  option_groups: OptionGroupMealRequest[];

@ApiProperty()
@IsString()
meal_id: string
//list of option prices
@ApiProperty({
  type: [AddMealOptionPriceRequest]
})
option_prices: AddMealOptionPriceRequest[]

}