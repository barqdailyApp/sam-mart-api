import { Module } from '@nestjs/common';
import { BanarController } from './food-banar.controller';
import { BanarService } from './food-banar.service';

@Module({
  providers: [BanarService],
  controllers: [BanarController]
})
export class FoodBanarModule {}
