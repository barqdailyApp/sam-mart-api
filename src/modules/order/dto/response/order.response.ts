import { Exclude, Expose, Transform, Type, plainToClass } from 'class-transformer';
import { DeliveryType } from 'src/infrastructure/data/enums/delivery-type.enum';
import { PaymentMethodEnum } from 'src/infrastructure/data/enums/payment-method';
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

  @Expose() @Type(() => UserResponse) readonly user: UserResponse;

  @Expose() @Type(() => WarehouseResponse) readonly warehouse: WarehouseResponse;

  @Expose() @Type(() => AddressResponse) readonly address: AddressResponse;

  @Transform(({ value }) => plainToClass(SectionResponse, value))
  @Expose()
  readonly section: SectionResponse;

  @Transform(({ value }) => plainToClass(ShipmentResponse, value))
  @Expose()
  readonly shipments: ShipmentResponse[];

  @Transform(({ obj }) => {
    return obj.shipments?.reduce(
      (acc, shipment) => acc + shipment?.shipment_products?.length,
      0,
    );
  })
  @Expose()
  readonly order_products: number;

  @Expose() readonly total_price: number;
  @Expose() readonly wallet_discount: number;

  @Expose() readonly payment_method: PaymentMethodEnum;

  @Expose() readonly is_paid: boolean;

  @Expose() readonly delivery_type: DeliveryType;

  @Expose() readonly estimated_delivery_time: Date;

  @Expose() readonly slot_id: string;

  @Expose() readonly delivery_day: string;

  @Expose() readonly number: string;

  @Expose() readonly delivery_fee: number;

  @Expose() readonly promo_code_discount: number;

}
