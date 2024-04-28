import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from 'src/infrastructure/entities/wallet/transaction.entity';
import { Wallet } from 'src/infrastructure/entities/wallet/wallet.entity';
import { Repository } from 'typeorm';
import { MakeTransactionRequest } from './dto/requests/make-transaction-request';
import { plainToInstance } from 'class-transformer';
import { BaseUserService } from 'src/core/base/service/user-service.base';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';

@Injectable()
export class TransactionService extends BaseUserService<Transaction> {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Wallet) private walletRepository: Repository<Wallet>,
    @Inject(REQUEST) request: Request,
  ) {
    super(transactionRepository, request);
  }

  async makeTransaction(req: MakeTransactionRequest) {

    const wallet = await this.walletRepository.findOneBy({
      user_id: req.user_id,
    });

    wallet.balance = Number( wallet.balance) + Number(req.amount);
   
    const transaction = plainToInstance(Transaction, {
      ...req,
      wallet_id: wallet.id,
    });



    await this.transactionRepository.save(transaction);
   
    await this.walletRepository.save(wallet);
  
    return transaction;
  }

  async getWallet(user_id: string) {
    const wallet = await this.walletRepository.findOne({
      where:{
      user_id:user_id?user_id: this.currentUser.id,},
    relations:{user:true},
    select:{user:{name:true,email:true,id:true}}  
    },
  );
    return wallet;
  }
}
