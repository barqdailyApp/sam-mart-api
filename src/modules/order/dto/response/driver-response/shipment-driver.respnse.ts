import { Exclude, Expose, Transform, plainToClass } from 'class-transformer';
import { DeliveryType } from 'src/infrastructure/data/enums/delivery-type.enum';
import { PaymentMethodEnum } from 'src/infrastructure/data/enums/payment-method';
import { ShipmentStatusEnum } from 'src/infrastructure/data/enums/shipment_status.enum';
import { User } from 'src/infrastructure/entities/user/user.entity';
import { AddressResponse } from 'src/modules/address/dto/responses/address.respone';
import { DriverResponse } from 'src/modules/driver/response/driver.response';
import { SectionResponse } from 'src/modules/section/dto/response/section.response';
import { ProfileResponse } from 'src/modules/user/dto/responses/profile.response';
import { UserResponse } from 'src/modules/user/dto/responses/user.response';
import { WarehouseResponse } from 'src/modules/warehouse/dto/response/warehouse.response';
import { ShipmentProductResponse } from '../shipment-product.response';
import { OrderDriverResponse } from './order-driver.response';

@Exclude()
export class ShipmentDriverResponse {
  @Expose() readonly id: string;

  @Transform(({ value }) => plainToClass(DriverResponse, value))
  @Expose()
  readonly driver: DriverResponse;

  @Transform(({ value }) => plainToClass(WarehouseResponse, value))
  @Expose()
  readonly warehouse: WarehouseResponse;

  @Transform(({ value }) => plainToClass(ShipmentProductResponse, value))
  @Expose()
  readonly shipment_products: ShipmentProductResponse[];


  
  @Transform(({ value }) => plainToClass(OrderDriverResponse, value))
  @Expose()
  readonly order: OrderDriverResponse;
  @Expose() readonly status: ShipmentStatusEnum;

  @Expose() readonly order_confirmed_at: Date;

  @Expose() readonly order_on_processed_at: Date;

  @Expose() readonly order_shipped_at: Date;

  @Expose() readonly order_delivered_at: Date;
}
