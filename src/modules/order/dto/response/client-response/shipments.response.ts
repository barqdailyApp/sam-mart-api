import { Exclude, Expose } from 'class-transformer';
import { toUrl } from 'src/core/helpers/file.helper';
import { ShipmentStatusEnum } from 'src/infrastructure/data/enums/shipment_status.enum';
import { Shipment } from 'src/infrastructure/entities/order/shipment.entity';

@Exclude()
export class ShipmentsResponse {
  @Expose() shipment_id: string;
  @Expose() status: ShipmentStatusEnum;
  @Expose() order_confirmed_at: Date;
  @Expose() order_on_processed_at: Date;
  @Expose() order_shipped_at: Date;
  @Expose() order_delivered_at: Date;

  @Expose() order: any;

  @Expose() warehouse: any;

  @Expose() driver: any;

  constructor(shipments: Shipment) {
    this.shipment_id = shipments.id;
    this.status = shipments.status;
    this.order_confirmed_at = shipments.order_confirmed_at;
    this.order_on_processed_at = shipments.order_on_processed_at;
    this.order_shipped_at = shipments.order_shipped_at;
    this.order_delivered_at = shipments.order_delivered_at;

    this.order = {
      id: shipments.order.id,
      number: shipments.order.number,
      total_price: shipments.order.total_price,
      is_paid: shipments.order.is_paid,
      payment_method: shipments.order.payment_method,
      delivery_type: shipments.order.delivery_type,
      delivery_day: shipments.order.delivery_day,
      created_at: shipments.order.created_at,
      client: {
        id: shipments.order.user.id,
        name: shipments.order.user.name,
        email: shipments.order.user.email,
        phone: shipments.order.user.phone,
        avatar: toUrl(shipments.order.user.avatar),
      },
      address: {
        id: shipments.order.address.id,
        name: shipments.order.address.name,
        address: shipments.order.address.address,
        latitude: shipments.order.address.latitude,
        longitude: shipments.order.address.longitude,
      },
    };
    

    this.warehouse = {
      id: shipments.warehouse.id,
      name_ar: shipments.warehouse.name_ar,
      name_en: shipments.warehouse.name_en,
      latitude: shipments.warehouse.latitude,
      longitude: shipments.warehouse.longitude,
    };

    this.driver = shipments.driver
      ? {
          id: shipments.driver.id,
          name: shipments.driver.user.name,
          phone: shipments.driver.user.phone,
          email: shipments.driver.user.email,
          avatar: toUrl(shipments.driver.user.avatar),
        }
      : null;


  }
}
