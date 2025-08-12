import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { Transaction } from 'typeorm';
import { TransactionModule } from '../transaction/transaction.module';

@Module({
  imports:[TransactionModule],
  providers: [CartService],
  controllers: [CartController]
})
export class CartModule {}
