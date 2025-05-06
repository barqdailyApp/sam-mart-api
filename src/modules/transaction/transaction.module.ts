import { Module } from '@nestjs/common';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { AddressModule } from '../address/address.module';

@Module({

  controllers: [TransactionController],
  providers: [TransactionService],
  exports: [TransactionService,],

})
export class TransactionModule {}
