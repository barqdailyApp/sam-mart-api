import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from 'src/infrastructure/entities/wallet/transaction.entity';
import { Wallet } from 'src/infrastructure/entities/wallet/wallet.entity';
import { In, Repository } from 'typeorm';
import { MakeTransactionRequest } from './dto/requests/make-transaction-request';
import { plainToInstance } from 'class-transformer';
import { BaseUserService } from 'src/core/base/service/user-service.base';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';
import { TransactionTypes } from 'src/infrastructure/data/enums/transaction-types';
import { tr } from '@faker-js/faker';
import { FileService } from '../file/file.service';

@Injectable()
export class TransactionService extends BaseUserService<Transaction> {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Wallet) private walletRepository: Repository<Wallet>,
    @Inject(REQUEST) request: Request,
    @Inject(FileService) private _fileService: FileService,
  ) {
    super(transactionRepository, request);
  }

  async makeTransaction(req: MakeTransactionRequest) {
    const wallet = await this.walletRepository.findOneBy({
      user_id: req.user_id,type:req.wallet_type
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');}

    wallet.balance = Number(wallet.balance) + Number(req.amount);

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
      where: {
        user_id: user_id ? user_id : this.currentUser.id,
      },
      relations: { user: true },
      select: { user: { name: true, email: true, id: true } },
    });
    return wallet;
  }

  async getSystemWallets() {
    const wallets = await this.walletRepository.find({
      where: {
        type: In(["JAIB", "KURAIMI", "JAWALI,BARQ_WALLET"]),
      },
  
    });
    return wallets;
  }

  async getDriverTransactions(
    start_date?: Date,
    to_date?: Date,
    transaction_type?: TransactionTypes,
  ) {
    start_date.setHours(start_date.getHours() - 3);
    to_date.setHours(21);
    const transactions = await this.transactionRepository
      .createQueryBuilder('transaction')
      .where(
        'transaction.created_at > :start_date AND transaction.created_at < :to_date',
        {
          start_date: start_date ?? null,
          to_date: to_date ?? null,
        },
      )
      .andWhere('transaction.type = :transaction_type', {
        transaction_type: transaction_type,
      })
      .leftJoinAndSelect('transaction.order', 'order')
      .leftJoinAndSelect('transaction.user', 'user')
      .where('user.roles = :role', { role: 'DRIVER' })
      .orderBy('transaction.created_at', 'DESC')
      .getMany();

    if (transactions.length < 1)
      throw new NotFoundException('message.transactions_not_found');
    const result=transactions.map((transaction) => {
      return {
        id: transaction.id,
        order_number: transaction.order?.number,
        driver_name: transaction.user?.name,
        driver_number: transaction.user?.phone,
        transaction_type: transaction.type,
        amount: transaction.amount,
        created_at: transaction.created_at,
      };
    })
    return await this._fileService.exportExcel(
      result,
      'transactions',
      'transactions',
    );
  }
}
