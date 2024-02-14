import { ApiProperty } from "@nestjs/swagger";
import { IsLatitude, IsLongitude, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateWorkingAreaRequest {
    @ApiProperty()
    @IsNotEmpty()
    @IsLatitude()
    latitude: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsLongitude()
    longitude: string;

    @ApiProperty()
    @IsNumber()
    range:number

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    name: string;
  
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    address: string;

}