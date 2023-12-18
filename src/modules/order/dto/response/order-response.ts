import { Exclude, Expose, Transform, plainToInstance } from 'class-transformer';

import { OrderStatus } from 'src/infrastructure/data/enums/order-status.enum';
import { Biker } from 'src/infrastructure/entities/biker/biker.entity';
import { Customer } from 'src/infrastructure/entities/customer/customer.entity';
import { OrderInvoice } from 'src/infrastructure/entities/order/order-invoice.entity';
import { SubscriptionPackageService } from 'src/infrastructure/entities/subscription/subscription-service.entity';
import { Subscription } from 'src/infrastructure/entities/subscription/subscription.entity';
import { Address } from 'src/infrastructure/entities/user/address.entity';
import { Vehicle } from 'src/infrastructure/entities/vehicle/vehicle.entity';
import { BikerResponse } from 'src/modules/biker/dto/response/biker.response';
import { SlotResponse } from 'src/modules/slots/dto/respones/slot.response';
import { SubscriptionResponse } from 'src/modules/subscription/dto/subscroption.response';
import { UserInfoResponse } from 'src/modules/user/dto/responses/profile.response';
import { VehicleResponse } from 'src/modules/vehicle/dto/responses/vehicle.respone';

export class OrderResponse {
  @Expose()
  number: string;

  @Expose()
  id: string;

  @Expose()
  is_reschedule?: boolean;
  
  @Expose()
  wash_count_current: number;
  @Expose()
  wash_time?: number;

  @Expose()
  status: OrderStatus;
  @Expose()
  subscription: SubscriptionResponse;
  @Expose()
  services: any;

  @Expose()
  biker: BikerResponse;
  @Expose()
  customer: any;
  @Expose()
  slot: SlotResponse;
  @Expose()
  order_date: string;

  @Expose()
  vehicle: VehicleResponse;

  @Expose()
  address: Address;

  @Expose()
  order_invoice: OrderInvoice;

  constructor(data: Partial<OrderResponse>) {
    Object.assign(this, data);
    if (data.biker) {
      this.biker = new BikerResponse(data.biker);
    }
    if (data.customer) {
      this.customer = new UserInfoResponse(data.customer.user);
    }
    if (data.slot) {
      this.slot = new SlotResponse(data.slot);
    }
    if (data.vehicle) {
      this.vehicle = new VehicleResponse(data.vehicle);
    }
    if (data.subscription) {
      this.subscription = new SubscriptionResponse(data.subscription);
    }
  }
}
