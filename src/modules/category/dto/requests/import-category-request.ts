import { ApiProperty } from "@nestjs/swagger";

export class ImportCategoryRequest {
    @ApiProperty({ type: 'file', required: true })
    file: Express.Multer.File;
}