import { Exclude, Expose } from 'class-transformer';
import { DeliveryType } from 'src/infrastructure/data/enums/delivery-type.enum';
import { PaymentMethod } from 'src/infrastructure/data/enums/payment-method';
import { Order } from 'src/infrastructure/entities/order/order.entity';

@Exclude()
export class OrdersDashboardResponse {
  @Expose() order_id: string;
  @Expose() slot_id: string;
  @Expose() section_id: string;
  @Expose() order_created_at: Date;
  
  @Expose() order_number: string;
  @Expose() delivery_type: DeliveryType;

  
  @Expose() total_price: number;
  @Expose() payment_method: PaymentMethod;
  @Expose() is_paid: boolean;
  @Expose() delivery_day: string;

  @Expose() order_products: number;

  @Expose() warehouse: any;
  @Expose() user: any;
  @Expose() address: any;
  @Expose() shipments: any;

  constructor(order: Order) {
    this.order_id = order.id;
    this.slot_id = order.slot_id;
    this.section_id = order.section_id;
    this.order_created_at = order.created_at;
    this.order_number = order.number;
    this.order_products = order.shipments[0].shipment_products.length;
    this.total_price = order.total_price;
    this.payment_method = order.payment_method;
    this.is_paid = order.is_paid;
    this.delivery_day = order.delivery_day;
    this.delivery_type = order.delivery_type;
    this.warehouse = {
      id: order.warehouse.id,
      name_ar: order.warehouse.name_ar,
      name_en: order.warehouse.name_en,      
      latitude: order.warehouse.latitude,
      longitude: order.warehouse.longitude,
    }
    this.user = {
      id: order.user.id,
      username: order.user.name,
      email: order.user.email,
      phone: order.user.phone,
    };
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
      driver: order.shipments[0].driver_id !=null
        ? {
            id: order.shipments[0].driver.user.id,
            username: order.shipments[0].driver.user.name,
            email: order.shipments[0].driver.user.email,
            phone: order.shipments[0].driver.user.phone,
          }
        : null,
      status: order.shipments[0].status,
      order_confirmed_at: order.shipments[0].order_confirmed_at,
      order_on_processed_at: order.shipments[0].order_on_processed_at,
      order_shipped_at: order.shipments[0].order_shipped_at,
      order_delivered_at: order.shipments[0].order_delivered_at,
      order_canceled_at: order.shipments[0].order_canceled_at,
    };
  }
}
