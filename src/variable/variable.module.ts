import { Module } from '@nestjs/common';
import { VariableService } from './variable.service';
import { VariableController } from './variable.controller';

@Module({
  providers: [VariableService],
  controllers: [VariableController]
})
export class VariableModule {}
