import { Exclude, Expose } from 'class-transformer';
import { toUrl } from 'src/core/helpers/file.helper';
import { DeliveryType } from 'src/infrastructure/data/enums/delivery-type.enum';
import { PaymentMethod } from 'src/infrastructure/data/enums/payment-method';
import { Order } from 'src/infrastructure/entities/order/order.entity';

@Exclude()
export class OrdersResponse {
  @Expose() order_id: string;
  @Expose() order_number: string;
  @Expose() total_price: number;
  @Expose() address: any;
  @Expose() shipments: any;

  constructor(order: Order) {
    this.order_id = order.id;
    this.order_number = order.number;
    this.total_price = order.total_price;

    this.address = {
      id: order.address.id,
      name: order.address.name,
      address: order.address.address,
      latitude: order.address.latitude,
      longitude: order.address.longitude,
    };
    this.shipments = {
      id: order.shipments[0].id,
      order_id: order.shipments[0].order_id,
      driver: order.shipments[0].driver_id
        ? {
            id: order.shipments[0].driver.user.id,
            username: order.shipments[0].driver.user.name,
            phone: order.shipments[0].driver.user.phone,
            avatar: toUrl(order.shipments[0].driver.user.avatar),
            latitude: order.shipments[0].driver.latitude,
            longitude: order.shipments[0].driver.longitude,
          }
        : null,
      status: order.shipments[0].status,
    };
  }
}
