import { ApiProperty } from "@nestjs/swagger";
import { isArray, IsNotEmpty, IsNumber, IsOptional, IsString, IsStrongPassword, Matches } from "class-validator";
import { Unique } from "src/core/validators/unique-constraints.validator";

export class UpdateRestaurantRequest {
    @ApiProperty()
    @IsOptional()
    @IsString()
    name_ar: string; 
    @ApiProperty()
    @IsOptional()
    @IsString()
    name_en: string; 


    @ApiProperty()
    @IsOptional()
    @IsString()
    address_ar: string;
    @ApiProperty()
    @IsOptional()
    @IsString()
    address_en: string;
    @ApiProperty()
    @IsOptional()
    @IsString()
    logo: string;
    @ApiProperty()
    @IsOptional()
    @IsString()
    image: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    city_id: string;
    @ApiProperty({isArray:true})
    @IsOptional()
    cuisines_types_ids: string[];
    
      @ApiProperty()
      @IsOptional()
      @IsString()
      @Matches(
        /^(\+|-)?(?:90(?:(?:\.0{1,15})?)|(?:[0-9]|[1-8][0-9])(?:(?:\.[0-9]{1,15})?))$/,
        { message: 'invalid value for latitude' },
      )
      latitude: string;
    
      @ApiProperty()
      @IsOptional()
      @IsString()
      @Matches(
        /^(\+|-)?(?:180(?:(?:\.0{1,15})?)|(?:[0-9]|[1-9][0-9]|1[0-7][0-9])(?:(?:\.[0-9]{1,15})?))$/,
        { message: 'invalid value for longitude' },
      )
      longitude: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    opening_time: string;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    min_order_price: number;
  
    @ApiProperty()
    @IsOptional()
    @IsString()
    closing_time: string;    

    // @ApiProperty({isArray:true})
    // @IsOptional()
    // menu: string[];  
    // @ApiProperty({isArray:true})
    // @IsOptional()
    // licenses: string[]; 
} 