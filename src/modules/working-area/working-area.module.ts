import { Module } from '@nestjs/common';
import { WorkingAreaService } from './working-area.service';
import { WorkingAreaController } from './working-area.controller';

@Module({
  providers: [WorkingAreaService],
  controllers: [WorkingAreaController]
})
export class WorkingAreaModule {}
