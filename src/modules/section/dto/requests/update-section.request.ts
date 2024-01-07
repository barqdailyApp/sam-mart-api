import { ApiProperty } from "@nestjs/swagger";
import { CreateSectionRequest } from "./create-section.request";

export class UpdateSectionRequest extends CreateSectionRequest{

    @ApiProperty()
    id:string
}