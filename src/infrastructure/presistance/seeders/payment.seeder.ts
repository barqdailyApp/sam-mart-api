import { Injectable } from '@nestjs/common';
import { Seeder, DataFactory } from 'nestjs-seeder';
import { InjectRepository } from '@nestjs/typeorm';
import { Index, Repository } from 'typeorm';
import { User } from 'src/infrastructure/entities/user/user.entity';
import { Address } from 'src/infrastructure/entities/user/address.entity';
import { Country } from 'src/infrastructure/entities/country/country.entity';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { City } from 'src/infrastructure/entities/city/city.entity';
import { Region } from 'src/infrastructure/entities/region/region.entity';
import { Category } from 'src/infrastructure/entities/category/category.entity';
import { Subcategory } from 'src/infrastructure/entities/category/subcategory.entity';
import { Section } from 'src/infrastructure/entities/section/section.entity';
import { CategorySubCategory } from 'src/infrastructure/entities/category/category-subcategory.entity';
import { SectionCategory } from 'src/infrastructure/entities/section/section-category.entity';
import { PaymentMethod } from 'src/infrastructure/entities/payment_method/payment_method.entity';
import { PaymentMethodEnum } from 'src/infrastructure/data/enums/payment-method';

@Injectable()
export class PaymentSeeder implements Seeder {
  constructor(
    @InjectRepository(PaymentMethod)
    private readonly payment_repo: Repository<PaymentMethod>,
  ) {}

  async seed(): Promise<any> {
    const Images_path = [
      'assets/images/payment/wallet.png',
      'assets/images/payment/dollar.png',
      'assets/images/payment/digital_wallet.png',
    ];

    const name_ar = ['محفظة 1', 'كاش', 'محفظة 2'];

    const name_en = ['Wallet 1', 'Cash', 'Wallet 2'];

    for (let index = 0; index < Images_path.length; index++) {
      await this.payment_repo.save(
        new PaymentMethod({
          name_ar: name_ar[index],
          name_en: name_en[index],
          logo: Images_path[index],
          type: index == 1 ? PaymentMethodEnum.CASH : PaymentMethodEnum.WALLET,
        }),
      );
    }
  }

  async drop(): Promise<any> {
    return await this.payment_repo.delete({});
  }
}
