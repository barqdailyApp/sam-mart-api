import { ApiProperty } from "@nestjs/swagger";
import { IsLatitude, IsLongitude, IsNotEmpty, IsNumber } from "class-validator";

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

}