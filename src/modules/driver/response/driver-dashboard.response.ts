import { Exclude, Expose, Transform } from 'class-transformer';
import { toUrl } from 'src/core/helpers/file.helper';
import { DriverStatus } from 'src/infrastructure/data/enums/driver-status.enum';
import { DriverTypeEnum } from 'src/infrastructure/data/enums/driver-type.eum';
import { Gender } from 'src/infrastructure/data/enums/gender.enum';
import { UserStatus } from 'src/infrastructure/data/enums/user-status.enum';
import { Driver } from 'src/infrastructure/entities/driver/driver.entity';

@Exclude()
export class DriverDashboardResponse {
  @Expose() readonly id: string;
  @Expose() readonly username: string;
  @Expose() readonly user_id: string;

  @Expose() readonly email: string;
  @Expose() readonly phone: string;
  @Transform(({ value }) => toUrl(value))
  @Expose()
  readonly avatar: string;
  @Expose() readonly birth_date: string;
  @Expose() readonly created_at: Date;
  @Expose() readonly driver_status: DriverStatus;
  @Expose() readonly idCard: any;
  @Expose() readonly address: any;
  @Expose() readonly warehouse: any;
@Expose() readonly type:DriverTypeEnum
  @Expose() readonly vehicle: any;
  @Expose() readonly wallet_balance: number;

  constructor(driver: Driver) {
    this.id = driver.id;
    this.username = driver.user.name;
    this.type = driver.type;
    this.user_id = driver.user.id;
    this.email = driver.user.email;
    this.phone = driver.user.phone;
    this.avatar =toUrl(driver.user.avatar) ;
    this.birth_date = driver.user.birth_date;
    this.created_at = driver.user.created_at;
    this.address = {
      latitude: driver.latitude,
      longitude: driver.longitude,
      country: {
        id: driver.country.id,

        name_ar: driver.country.name_ar,
        name_en: driver.country.name_en,
      },
      city: {
        id: driver.city.id,
        name_ar: driver.city.name_ar,
        name_en: driver.city.name_en,
      },
      region: {
        id: driver.region.id,
        name_ar: driver.region.name_ar,
        name_en: driver.region.name_en,
      },
    };
    this.driver_status = driver.status;
    (this.vehicle = {
      vehicle_type: driver.vehicle_type,
      vehicle_color: driver.vehicle_color,
      vehicle_model: driver.vehicle_model,
      license_number: driver.license_number,
      license_image: toUrl(driver.license_image),
    }),
      (this.idCard = {
        id_card_number: driver.id_card_number,
        id_card_image: toUrl(driver.id_card_image),
      });
    this.warehouse =
      driver.warehouse == undefined
        ? null
        : {
            id: driver.warehouse.id,
            name_ar: driver.warehouse.name_ar,
            name_en: driver.warehouse.name_en,
          };
    this.wallet_balance =
      driver.user.wallet == undefined ? 0 : driver.user.wallet.balance;
  }
}
