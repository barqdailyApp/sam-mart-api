import { Module } from '@nestjs/common';
import { SectionService } from './section.service';
import { SectionController } from './section.controller';
import { OrderService } from '../order/order.service';
import { OrderModule } from '../order/order.module';

@Module({
  imports:[OrderModule],
  providers: [SectionService],
  controllers: [SectionController]
})
export class SectionModule {}
