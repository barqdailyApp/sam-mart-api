import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsDate, IsNumber, IsOptional, IsString } from "class-validator";

export class CreatePromoCodeRequest {
    @ApiProperty()
    @IsString()
    code: string;
    @ApiProperty()
    @IsNumber()
    @Transform(({ value }) => Number(value))
    discount: number;
    @ApiProperty()
    @IsDate()
    @Transform(({ value }) => new Date(value))
    expire_at: Date;
    @ApiProperty()
    @IsNumber()
    number_of_uses: number;

    @ApiProperty({required:false})
    @IsOptional()
    @IsString()
    note:string

    
}


export class AddPromoCodePaymentMethodRequest {
  @ApiProperty()
  @IsString()
  promo_code_id: string;

  @ApiProperty()
  @IsString()
  payment_method_id: string;




}