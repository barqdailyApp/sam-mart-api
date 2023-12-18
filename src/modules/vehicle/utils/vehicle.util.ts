import * as sharp from 'sharp';
import { ConfigService } from "@nestjs/config";
import { StorageService } from '@codebrew/nestjs-storage/dist';
import { Inject, Injectable } from "@nestjs/common";

@Injectable()
export class UploadUtil {
    constructor(
        @Inject(StorageService) private readonly storage: StorageService,
        @Inject(ConfigService) private readonly config: ConfigService,
    ) { }

    async uploadImage(image: Express.Multer.File): Promise<string> {
        const baseUrl = this.config.get('storage.baseUrl');
        let fileLocation = `${baseUrl}/avatars/default.png`;
        if (image) {
            const ext = image.originalname.split('.').pop();
            const randName = image.originalname.split('.').shift() + '-' + new Date().getTime();
            fileLocation = `${baseUrl}/vehicles/${randName}.${ext}`;
            // use sharp to resize image
            const resizedImage = await sharp(image.buffer)
                .resize(300, 300, {
                    fit: sharp.fit.cover,
                    position: sharp.strategy.entropy,
                })
                .toBuffer();
            await this.storage.getDisk().put(fileLocation, resizedImage);
        }
        return fileLocation;
    }
}