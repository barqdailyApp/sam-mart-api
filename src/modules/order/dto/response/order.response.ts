import { Exclude, Expose, Transform, plainToClass } from 'class-transformer';
import { DeliveryType } from 'src/infrastructure/data/enums/delivery-type.enum';
import { PaymentMethod } from 'src/infrastructure/data/enums/payment-method';
import { User } from 'src/infrastructure/entities/user/user.entity';
import { AddressResponse } from 'src/modules/address/dto/responses/address.respone';
import { SectionResponse } from 'src/modules/section/dto/response/section.response';
import { ProfileResponse } from 'src/modules/user/dto/responses/profile.response';
import { UserResponse } from 'src/modules/user/dto/responses/user.response';
import { WarehouseResponse } from 'src/modules/warehouse/dto/response/warehouse.response';
import { ShipmentResponse } from './shipment.response';

@Exclude()
export class OrderResponse {
  @Expose() readonly id: string;

  @Transform(({ value }) => plainToClass(UserResponse, value))
  @Expose()
  readonly user: UserResponse;

  @Transform(({ value }) => plainToClass(WarehouseResponse, value))
  @Expose()
  readonly warehouse: WarehouseResponse;

  @Transform(({ value }) => plainToClass(AddressResponse, value))
  @Expose()
  readonly address: AddressResponse;

  @Transform(({ value }) => plainToClass(SectionResponse, value))
  @Expose()
  readonly section: SectionResponse;

  @Transform(({ value }) => plainToClass(ShipmentResponse, value))
  @Expose()
  readonly shipments: ShipmentResponse[];

  @Transform(({ obj }) => {
    return obj.shipments.reduce(
      (acc, shipment) => acc + shipment.shipment_products.length,
      0,
    );
  })
  @Expose()
  readonly order_products: number;

  @Expose() readonly total_price: number;

  @Expose() readonly payment_method: PaymentMethod;

  @Expose() readonly is_paid: boolean;

  @Expose() readonly delivery_type: DeliveryType;

  @Expose() readonly estimated_delivery_time: Date;

  @Expose() readonly slot_id: string;

  @Expose() readonly delivery_day: string;
  @Expose() readonly number: string;
  @Expose() readonly delivery_fee: number;

}
