import { Otp } from '../entities/auth/otp.entity';
import { User } from '../entities/user/user.entity';
import { Address } from '../entities/user/address.entity';
import { Country } from '../entities/country/country.entity';
import { City } from '../entities/city/city.entity';
import { WorkingArea } from '../entities/working-area/working-area.entity';
import { Driver } from '../entities/driver/driver.entity';
import { Region } from '../entities/region/region.entity';


export const DB_ENTITIES = [
  User,
  Address,
  Otp,
  Country,
  City,
  WorkingArea,
  Driver,
  Region
];

export const DB_VIEWS = [];
