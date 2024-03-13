import { ApiProperty } from "@nestjs/swagger";
import { CreateReasonRequest } from "./create-reason.request";
import { IsOptional } from "class-validator";
import { ReasonType } from "src/infrastructure/data/enums/reason-type.enum";

export class UpdateReasonRequest extends CreateReasonRequest {
    @ApiProperty({ required: false, description: 'Reason name in arabic' })
    @IsOptional()
    name_ar: string;

    @ApiProperty({ required: false, description: 'Reason name in english' })
    @IsOptional()
    name_en: string;

    @ApiProperty({
        required: false,
        type: 'enum',
        enum: ReasonType,
        enumName: 'ReasonType',
        description: 'Reason type'
    })
    @IsOptional()
    type: ReasonType;
}