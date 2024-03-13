import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";
import { ReasonType } from "src/infrastructure/data/enums/reason-type.enum";

export class GetReasonQueryRequest {
    @ApiProperty({
        required: true,
        type: 'enum',
        enum: ReasonType,
        enumName: 'ReasonType',
        description: 'Reason type'
    })
    @IsEnum(ReasonType)
    type: ReasonType;
}