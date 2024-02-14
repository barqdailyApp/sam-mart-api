import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsLatitude, IsLongitude, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class UpdateWorkingAreaRequest {
    @ApiProperty({required:false})

    @IsLatitude()
    latitude: string;

    @ApiProperty({required:false})
   
    
    longitude: string;

    @ApiProperty({required:false})

    range:number
    @ApiProperty({required:false})
    @IsBoolean()
    active:boolean

    @ApiProperty()
    @IsNotEmpty() @IsString()
    id: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    name: string;
  
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    address: string;

}