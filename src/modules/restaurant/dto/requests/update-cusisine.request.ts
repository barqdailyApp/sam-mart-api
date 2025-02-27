import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";


export class UpdateCuisineRequest{


    @ApiProperty()
    @IsString()
    id:string
      @ApiProperty()
      @IsString()
      @IsOptional()
      name_ar: string;
      @ApiProperty()
      @IsString()
      @IsOptional()
      name_en: string;
      @ApiProperty()
      @IsString()
      @IsOptional()
      logo: string;
      @ApiProperty()
      @IsBoolean()
      @IsOptional()
      is_active: boolean;
      @ApiProperty()
      @IsNumber()
      @IsOptional()
      @Transform(({ value }) => Number(value))
      order_by: number;
    
}