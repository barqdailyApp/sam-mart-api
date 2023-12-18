import { Exclude, Expose, Transform, plainToInstance } from 'class-transformer';
import { toUrl } from 'src/core/helpers/file.helper';

import { OrderStatus } from 'src/infrastructure/data/enums/order-status.enum';
import { SubscriptionStatus } from 'src/infrastructure/data/enums/subscription.enum';
import { Biker } from 'src/infrastructure/entities/biker/biker.entity';
import { Customer } from 'src/infrastructure/entities/customer/customer.entity';
import { OrderInvoice } from 'src/infrastructure/entities/order/order-invoice.entity';
import { Order } from 'src/infrastructure/entities/order/order.entity';
import { PromoCode } from 'src/infrastructure/entities/promo-code/promo-code.entity';
import { SubscriptionPackageService } from 'src/infrastructure/entities/subscription/subscription-service.entity';
import { Subscription } from 'src/infrastructure/entities/subscription/subscription.entity';
import { Address } from 'src/infrastructure/entities/user/address.entity';
import { Vehicle } from 'src/infrastructure/entities/vehicle/vehicle.entity';
import { BikerResponse } from 'src/modules/biker/dto/response/biker.response';
import { OrderResponse } from 'src/modules/order/dto/response/order-response';
import { SlotResponse } from 'src/modules/slots/dto/respones/slot.response';
import { UserInfoResponse } from 'src/modules/user/dto/responses/profile.response';
import { VehicleResponse } from 'src/modules/vehicle/dto/responses/vehicle.respone';

export class SubscriptionResponse {
  name_ar: string;

  name_en: string;

  total_price_package: number;

  price_wash_single: number;

  wash_count: number;

  total_was_count: number;

  status: SubscriptionStatus;

  description_ar: string;

  description_en: string;

  orders: OrderResponse[];

  background_url: string;

  expiry_date: Date;

  service: SubscriptionPackageService[];

  promo_code: PromoCode;

  promo_code_id: string;
  constructor(data: Partial<SubscriptionResponse>) {
    Object.assign(this, data);

    if (this.background_url) {
      if (this.background_url.includes('assets')) {
        this.background_url = toUrl(this.background_url, true);
      } else {
        this.background_url = toUrl(this.background_url);
      }
    }
    if (data.orders) {
      this.orders = data.orders.map((item) => new OrderResponse(item));
    }
  }
}
