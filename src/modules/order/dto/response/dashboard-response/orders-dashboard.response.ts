import { Exclude, Expose } from 'class-transformer';
import { DeliveryType } from 'src/infrastructure/data/enums/delivery-type.enum';
import { PaymentMethodEnum } from 'src/infrastructure/data/enums/payment-method';
import { Order } from 'src/infrastructure/entities/order/order.entity';
import { PaymentMethod } from 'src/infrastructure/entities/payment_method/payment_method.entity';

@Exclude()
export class OrdersDashboardResponse {
  @Expose() order_id: string;
  @Expose() slot_id: string;
  @Expose() section_id: string;
  @Expose() order_created_at: Date;
  @Expose() canceled_by: string;

  @Expose() order_number: string;
  @Expose() transaction_number: string;

  @Expose() delivery_type: DeliveryType;
  @Expose() delivery_fee: number;

  @Expose() total_price: number;
  @Expose() payment_method: PaymentMethodEnum;
  @Expose() payment_info: PaymentMethod;

  @Expose() is_paid: boolean;
  @Expose() delivery_day: string;

  @Expose() order_products: number;

  @Expose() warehouse: any;
  @Expose() user: any;
  @Expose() address: any;
  @Expose() shipments: any;
  @Expose() promo_code_discount: number;
  @Expose() estimated_delivery_time: Date;
  @Expose() products_price: number;

  constructor(order: Order) {
    this.order_id = order.id;
    this.slot_id = order.slot_id;
    this.section_id = order.section_id;
    this.order_created_at = order.created_at;
    this.order_number = order.number;
    this.promo_code_discount = order.promo_code_discount;
    this.transaction_number = order.transaction_number;
    this.order_products = order.shipments[0].shipment_products.length;
    this.total_price = order.total_price;
    this.products_price = order.products_price;
    this.payment_method = order.payment_method;
    this.is_paid = order.is_paid;
    this.estimated_delivery_time = order.estimated_delivery_time;
    this.delivery_day = order.delivery_day;
    this.delivery_type = order.delivery_type;
    this.delivery_fee = order.delivery_fee;
    this.payment_info = order.paymentMethod;
    this.warehouse = {
      id: order.warehouse.id,
      name_ar: order.warehouse.name_ar,
      name_en: order.warehouse.name_en,
      latitude: order.warehouse.latitude,
      longitude: order.warehouse.longitude,
    };
    this.user = {
      id: order.user.id,
      username: order.user.name,
      email: order.user.email,
      phone: order.user.phone,
      is_vip: order.user.orders_completed > 3 ? true : false,
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
      driver: order.shipments[0].driver
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
      canceled_by: order.shipments[0]?.canceled_by,
      cancel_reason: order.shipments[0]?.cancelShipmentReason,
    };
  }
}
