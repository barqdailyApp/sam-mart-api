import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from 'src/infrastructure/entities/wallet/transaction.entity';
import { Wallet } from 'src/infrastructure/entities/wallet/wallet.entity';
import { Repository } from 'typeorm';
import { MakeTransactionRequest } from './dto/requests/make-transaction-request';
import { plainToInstance } from 'class-transformer';
import { BaseUserService } from 'src/core/base/service/user-service.base';
import { Request } from 'express';

@Injectable()
export class TransactionService extends BaseUserService<Transaction> {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Wallet) private walletRepository: Repository<Wallet>,
    @Inject(Request) request: Request,
  ) {
    super(transactionRepository, request);
  }

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

  async getWallet() {
    const wallet = await this.walletRepository.findOneBy({
      user_id: this.currentUser.id,
    });
    return wallet;
  }
}
