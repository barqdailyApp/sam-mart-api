import { Module } from '@nestjs/common';
import { BanarController } from './banar.controller';
import { BanarService } from './banar.service';

@Module({
  providers: [BanarService],
  controllers: [BanarController]
})
export class BanarModule {}
