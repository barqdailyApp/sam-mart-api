import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { DriverTypeEnum } from "src/infrastructure/data/enums/driver-type.eum";

export class UpdatePromoCodeRequest {

    @ApiProperty()
  
    @IsString()
    id: string;
    @ApiProperty({required:false})
    @IsOptional()
    @IsString()
    code: string;
    @ApiProperty({required:false})
    @IsNumber()
    @IsOptional()
    @Transform(({ value }) => Number(value))
    discount: number;
    @ApiProperty({required:false})
    @IsOptional()
    @IsDate()
    @Transform(({ value }) => new Date(value))
    expire_at: Date;
    @ApiProperty({required:false})
    @IsOptional()
    @IsNumber()
    number_of_uses: number;
    @ApiProperty({required:false})
    @IsOptional()
    @Transform(({ value }) => Boolean(value))
    is_active: boolean;

    @ApiProperty({required:false})
    @IsOptional()
    @Transform(({ value }) => Boolean(value))
    use_once: boolean;

    @ApiProperty({required:false})
    @IsOptional()
    @IsString()
    note:string

      @ApiProperty({default:DriverTypeEnum.MART,enum:DriverTypeEnum})
    @IsNotEmpty()
    @IsString()
    @IsEnum(DriverTypeEnum)
    type:DriverTypeEnum

}