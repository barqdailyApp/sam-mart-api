import { Otp } from '../entities/auth/otp.entity';
import { User } from '../entities/user/user.entity';
import { Address } from '../entities/user/address.entity';
import { Country } from '../entities/country/country.entity';
import { City } from '../entities/city/city.entity';
import { WorkingArea } from '../entities/working-area/working-area.entity';
import { Driver } from '../entities/driver/driver.entity';
import { Region } from '../entities/region/region.entity';
import { MeasurementUnit } from '../entities/product/measurement-unit.entity';
import { ProductImage } from '../entities/product/product-image.entity';
import { ProductMeasurement } from '../entities/product/product-measurement.entity';
import { Product } from '../entities/product/product.entity';
import { AdditionalService } from '../entities/product/additional-service.entity';
import { ProductCategoryPrice } from '../entities/product/product-category-price.entity';
import { ProductService } from '../entities/product/product-service.entity';
import { ProductCategoryPriceModule } from 'src/modules/product-category-price/product-category-price.module';

export const DB_ENTITIES = [
  User,
  Address,
  Otp,
  Country,
  City,
  WorkingArea,
  Driver,
  Region,
  Product,
  MeasurementUnit,
  ProductMeasurement,
  ProductImage,
  AdditionalService,
  ProductCategoryPrice,
  ProductService,
  ProductCategoryPriceModule
];

export const DB_VIEWS = [];
