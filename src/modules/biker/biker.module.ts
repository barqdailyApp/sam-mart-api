import { Module } from '@nestjs/common';
import { BikerController } from './biker.controller';
import { BikerService } from './biker.service';

@Module({
  controllers: [BikerController],
  providers: [BikerService]
})
export class BikerModule {}
