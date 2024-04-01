import { Exclude, Expose } from 'class-transformer';
import { toUrl } from 'src/core/helpers/file.helper';
import { DeliveryType } from 'src/infrastructure/data/enums/delivery-type.enum';
import { PaymentMethodEnum } from 'src/infrastructure/data/enums/payment-method';
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
      driver: order.shipments[0].driver
        ? {
            id: order.shipments[0].driver.user.id,
            username: order.shipments[0].driver.user.name,
            phone: order.shipments[0].driver.user.phone,
            avatar: toUrl(order.shipments[0].driver.user.avatar),
            latitude: order.shipments[0].driver.latitude,
            longitude: order.shipments[0].driver.longitude,
          }
        : null,
      products: order.shipments[0].shipment_products.map((shipment_product) => {
        return {
          product_id: shipment_product.product_id,
          product_category_price_id: shipment_product.product_category_price.id,
          product_name_ar:
            shipment_product.product_category_price.product_sub_category.product
              .name_ar,
          product_name_en:
            shipment_product.product_category_price.product_sub_category.product
              .name_en,

          product_logo: toUrl(
            shipment_product.product_category_price.product_sub_category.product.product_images.find(
              (x) => x.is_logo === true,
            ).url,
          ),
          quantity: shipment_product.quantity,

          measurement_unit_name_ar:
            shipment_product.product_category_price.product_measurement
              .measurement_unit.name_ar,
          measurement_unit_name_en:
            shipment_product.product_category_price.product_measurement
              .measurement_unit.name_en,
        };
      }),
      status: order.shipments[0].status,
      feedback: order.shipments[0].order_feedback
        ? {
            id: order.shipments[0].order_feedback.id,
            communication: order.shipments[0].order_feedback.communication,
            packaging: order.shipments[0].order_feedback.packaging,
            delivery_time: order.shipments[0].order_feedback.delivery_time,
          }
        : null,
    };
  }
}
