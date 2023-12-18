import { Expose } from 'class-transformer';
import { Address } from 'src/infrastructure/entities/user/address.entity';
import { UserInfoResponse } from 'src/modules/user/dto/responses/profile.response';
import { VehicleResponse } from 'src/modules/vehicle/dto/responses/vehicle.respone';

export class OrderBikerResponse {
  @Expose()
  id: string;
  @Expose()
  order_date: string;

  @Expose()
  address: Address;
  @Expose()
  customer: any;
  constructor(data: Partial<OrderBikerResponse>) {
    this.id = data.id;
    this.order_date = data.order_date;
    this.address = data.address;
    if (data.customer) {
      this.customer = new UserInfoResponse(data.customer.user);
    }
  }
}
