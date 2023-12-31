import { AdditionalServiceSeeder } from "./additional-service.seeder";
import { CountryCityRegionSeeder } from "./countries-cities-regions";
import { MeasurementUnitSeeder } from "./measurement-unit.seeder";
import { ProductSeeder } from "./product.seeder";
import { UsersSeeder } from "./users.seeder";


export const DB_SEEDERS = [
 // UsersSeeder,
  CountryCityRegionSeeder,
  MeasurementUnitSeeder,
  AdditionalServiceSeeder,
  ProductSeeder
];
