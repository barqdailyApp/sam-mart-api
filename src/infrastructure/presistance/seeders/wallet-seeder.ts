
import { Seeder, DataFactory } from 'nestjs-seeder';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/infrastructure/entities/user/user.entity';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { Gender } from 'src/infrastructure/data/enums/gender.enum';
import { Wallet } from 'src/infrastructure/entities/wallet/wallet.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class WalletSeeder implements Seeder {
  constructor(
@InjectRepository(Wallet) private readonly wallet: Repository<Wallet>,
    
  ) { }

  async seed(): Promise<any> {
    const jaib_wallet =  new Wallet({type:'JAIB'});
    const jawali_wallet =  new Wallet({type:'JAWALI'});
    const kuraimi_wallet =  new Wallet({type:'KURAIMI'});
    const barq_wallet =  new Wallet({type:'BARQ_WALLET'});

  return  await this.wallet.save([jaib_wallet,jawali_wallet,kuraimi_wallet,barq_wallet]);

  }

  async drop(): Promise<any> {
    return this.wallet.delete({});
  }
}
