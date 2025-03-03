import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional } from "class-validator";

export class AddReviewRequest{

    @ApiProperty()
    @IsNumber()
    
    rating:number

    @ApiProperty()
    @IsOptional()
    comment:string
}