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
import { Category } from '../entities/category/category.entity';
import { Subcategory } from '../entities/category/subcategory.entity';
import { Section } from '../entities/section/section.entity';
import { SectionCategory } from '../entities/section/section-category.entity';
import { CategorySubCategory } from '../entities/category/category-subcategory.entity';
import { ProductCategoryPrice } from '../entities/product/product-category-price.entity';
import { ProductAdditionalService } from '../entities/product/product-additional-service.entity';
import { ProductCategoryPriceModule } from 'src/modules/product-category-price/product-category-price.module';
import { ProductSubCategory } from '../entities/product/product-sub-category.entity';
import { Banar } from '../entities/banar/banar.entity';
import { MostHitSubcategory } from '../entities/category/most-hit-subcategory.entity';
import { WarehouseProducts } from '../entities/warehouse/warehouse-products.entity';
import { WarehouseOperations } from '../entities/warehouse/warehouse-opreations.entity';
import { Warehouse } from '../entities/warehouse/warehouse.entity';
import { ProductOffer } from '../entities/product/product-offer.entity';

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
  Category,
  Subcategory,
  Section,
  SectionCategory,
  CategorySubCategory,
  ProductCategoryPrice,
  ProductAdditionalService,
  ProductCategoryPriceModule,
  ProductSubCategory,
  Banar,
  MostHitSubcategory,
  WarehouseProducts,
  WarehouseOperations,
  Warehouse,
  ProductOffer
];

export const DB_VIEWS = [];
