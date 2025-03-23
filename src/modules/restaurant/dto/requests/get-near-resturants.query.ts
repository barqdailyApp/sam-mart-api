import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsLatitude, IsLongitude, IsNotEmpty, IsNumber, IsString, Max, Min } from "class-validator";

export class GetNearResturantsQuery {
    @ApiProperty()
    @IsNotEmpty()
    @IsLatitude()
    latitude: number;
    @ApiProperty()
    @IsNotEmpty()
    @IsLongitude()
    longitude: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    @Max(50)
    @Transform(({ value }) => Number(value))
    radius: number;
}

export class GetNearResturantsQuerySearch extends GetNearResturantsQuery {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    name: string;


    @ApiProperty()
    @IsNotEmpty()
    @Transform(({ value }) => value === 'true')
    @IsBoolean()
    is_restaurant: boolean;
}