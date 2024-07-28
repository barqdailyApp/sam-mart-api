import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsNotEmpty, ValidateNested } from "class-validator";


export class AssignEmployeeRequest {
    @ApiProperty()
    @IsNotEmpty()
    @IsArray()
    module_ids: string[];
}