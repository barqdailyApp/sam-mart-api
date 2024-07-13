import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { TransactionTypes } from "src/infrastructure/data/enums/transaction-types";

export class MakeTransactionRequest {
  @ApiProperty()
  @IsNumber()
  @Transform((value) => Number(value))
  amount: number;
  @ApiProperty({required:false,enum:TransactionTypes,default:TransactionTypes.ADMIN_RESET})
  @IsEnum(TransactionTypes)
  type: TransactionTypes;
  @ApiProperty({required:false})
  @IsOptional()
  @IsString()
  order_id: string;
  @ApiProperty()
  @IsString()
  user_id: string;

  constructor(partial?: Partial<MakeTransactionRequest>) {
    Object.assign(this, partial);
  }
}
