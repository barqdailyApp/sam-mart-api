import { ApiProperty } from "@nestjs/swagger";
import { IsLatitude, IsLongitude, IsNotEmpty } from "class-validator";

export class UpdateUserLocationRequest {
    @ApiProperty()
    @IsNotEmpty()
    @IsLatitude()
    latitude: number;
  
    @ApiProperty()
    @IsNotEmpty()
    @IsLongitude()
    longitude: number;
  }
  