import { HttpStatus } from "@nestjs/common";
import { ParseFilePipeBuilder } from "@nestjs/common"

export interface IUploadValidatorOptions {
    fileSize?: number;
    fileType?: RegExp;
    required?: boolean;
}

export class UploadValidator {
    public fileType: RegExp;
    public fileSize: number;
    public required: boolean;
    constructor(options?: IUploadValidatorOptions) {
        this.fileType = options?.fileType ?? /^image\/(jpg|jpeg|png)$|application\/(vnd\.ms-excel|vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet)$/;
        this.fileSize = (options?.fileSize ?? 30000) * 100024 * 100024;
        this.required = options?.required ?? false;
    }

    build() {
        return new ParseFilePipeBuilder()
            .addMaxSizeValidator({ maxSize: this.fileSize })
            .addFileTypeValidator({ fileType: this.fileType })
            .build({ fileIsRequired: this.required, errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY })
    }
}