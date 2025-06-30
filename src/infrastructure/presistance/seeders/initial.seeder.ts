import { CategorySeeder } from './category-seeder';
import { AdditionalServiceSeeder } from './additional-service.seeder';
import { CountryCityRegionSeeder } from './countries-cities-regions';
import { MeasurementUnitSeeder } from './measurement-unit.seeder';
import { UsersSeeder } from './users.seeder';
import { BanarSeeder } from './banner.seeder';
import { StaticPageSeeder } from './static-pages.seeder';
import { SlotSeeder } from './slot.seeder';
import { ProductSeeder } from './product.seeder';
import { WareHouseSeeder } from './warehouse.seeder';
import { WareHouseProductsSeeder } from './warehouse-product.seeder';
import { SupportTicketSubjectSeeder } from './suppot-ticket-subjects.seeder';

import { ConstantSeeder } from './constant-seeder';
import { PaymentSeeder } from './payment.seeder';
import { SamModulesSeeder } from './sam-modules.seeder';
import { Wallet } from 'src/infrastructure/entities/wallet/wallet.entity';
import { WalletSeeder } from './wallet-seeder';

export const DB_SEEDERS = [
  UsersSeeder,
  // CountryCityRegionSeeder,
  // MeasurementUnitSeeder,
  // AdditionalServiceSeeder,
  // CategorySeeder,
  // ProductSeeder,
  // BanarSeeder,
  // StaticPageSeeder,
  // SlotSeeder,
  // WareHouseSeeder,
  // WareHouseProductsSeeder,
  // SupportTicketSubjectSeeder,
  ConstantSeeder,
  // // PaymentSeeder,
  // SamModulesSeeder,
  // WalletSeeder


];
