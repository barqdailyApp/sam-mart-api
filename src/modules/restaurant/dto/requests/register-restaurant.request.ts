import { ApiProperty } from "@nestjs/swagger";
import { isArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, IsStrongPassword, Matches } from "class-validator";
import { Unique } from "src/core/validators/unique-constraints.validator";
import { Transform } from "class-transformer";
export class RegisterRestaurantRequest {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    name_ar: string; 
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    name_en: string; 
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    user_name: string; 

    

    @ApiProperty()
    @IsNotEmpty()
    @IsStrongPassword()
    password: string; 
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @Unique('user')
    email: string; 
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @Unique('user')
    phone: string; 
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    address_ar: string;
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    address_en: string;
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    logo: string;
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    image: string;
    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    min_order_price: number;

        @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    average_prep_time: number;


    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    city_id: string;
    @ApiProperty({isArray:true})
    @IsNotEmpty()
    
    cuisines_types_ids: string[];
    
      @ApiProperty()
      @IsNotEmpty()
      @IsString()
      @Matches(
        /^(\+|-)?(?:90(?:(?:\.0{1,15})?)|(?:[0-9]|[1-8][0-9])(?:(?:\.[0-9]{1,15})?))$/,
        { message: 'invalid value for latitude' },
      )
      latitude: string;
    
      @ApiProperty()
      @IsNotEmpty()
      @IsString()
      @Matches(
        /^(\+|-)?(?:180(?:(?:\.0{1,15})?)|(?:[0-9]|[1-9][0-9]|1[0-7][0-9])(?:(?:\.[0-9]{1,15})?))$/,
        { message: 'invalid value for longitude' },
      )
      longitude: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    opening_time: string;
  
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    closing_time: string;    

    @ApiProperty({isArray:true})
    @IsNotEmpty()
    menu: string[];  
    @ApiProperty({isArray:true})
    @IsNotEmpty()
    licenses: string[]; 


  @ApiProperty({ isArray: true, required: false })
  @IsOptional()
  @Transform(({ value }) => {
    if (isArray(value)) {
      return value;
    }
    return value.split(',');
  })
  @IsString({ each: true })
  contact_numbers: string;


    @ApiProperty({required:false})
    @IsOptional()
    @IsBoolean()
    
    order_pickup:boolean

} 