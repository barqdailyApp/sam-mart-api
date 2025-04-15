import { ApiProperty } from "@nestjs/swagger";

export class EditSettingsRequest {
    @ApiProperty()
    id: string
    @ApiProperty()
    variable: string
}