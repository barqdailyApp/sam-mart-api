import { Module } from '@nestjs/common';
import { ImportExportService } from './import-export.service';

@Module({
  controllers: [],
  providers: [ImportExportService],
  exports: [],
})
export class MeasurementUnitModule {}
