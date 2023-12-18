import { Module } from '@nestjs/common';
import { SocialMediaController } from './social-media.controller';
import { SocialMediaService } from './social-media.service';

@Module({
  controllers: [SocialMediaController],
  providers: [SocialMediaService]
})
export class SocialMediaModule {}
