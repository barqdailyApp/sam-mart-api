import { FileController } from './file.controller';
import { FileService } from './file.service';
import { Global, Module } from '@nestjs/common';
@Global()
@Module({
    imports: [],
    controllers: [
        FileController
    ],
    providers: [
        FileService
    ],
    exports: [
        FileService
    ]
})
export class FileModule { }
