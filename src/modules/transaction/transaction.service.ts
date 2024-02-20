import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from 'src/infrastructure/entities/wallet/transaction.entity';
import { Wallet } from 'src/infrastructure/entities/wallet/wallet.entity';
import { Repository } from 'typeorm';
import { MakeTransactionRequest } from './dto/requests/make-transaction-request';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Wallet) private walletRepository: Repository<Wallet>,
  ) {}

  async makeTransaction(req: MakeTransactionRequest) {
    const wallet = await this.walletRepository.findOneBy({
      user_id: req.user_id,
    });
    wallet.balance = wallet.balance + req.amount;
    const transaction = plainToInstance(Transaction, {
      ...req,
      wallet_id: wallet.id,
    });

    await this.transactionRepository.save(transaction);
    await this.walletRepository.save(wallet);
    return transaction;
  }
}
