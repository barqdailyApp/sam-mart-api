import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class AddReviewRequest{

    @ApiProperty()
    @IsNumber()
    
    rating:number

    @ApiProperty()
    @IsOptional()
    comment:string
}

export class AddReviewReplyRequest{
    @ApiProperty()
    @IsString()
    comment:string
}