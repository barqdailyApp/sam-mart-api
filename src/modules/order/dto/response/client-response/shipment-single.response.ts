import { Exclude, Expose } from 'class-transformer';
import { toUrl } from 'src/core/helpers/file.helper';
import { ShipmentStatusEnum } from 'src/infrastructure/data/enums/shipment_status.enum';
import { Shipment } from 'src/infrastructure/entities/order/shipment.entity';

@Exclude()
export class ShipmentSingleResponse {
  @Expose() shipment_id: string;
  @Expose() status: ShipmentStatusEnum;
  @Expose() order_confirmed_at: Date;
  @Expose() order_on_processed_at: Date;
  @Expose() order_shipped_at: Date;
  @Expose() order_delivered_at: Date;
  @Expose() shipment_products: any;

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
    (this.shipment_products = shipments.shipment_products.map(
      (shipment_product) => {
        return {
          id: shipment_product.id,
          shipment_id: shipment_product.shipment_id,
          product_id: shipment_product.product_id,
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

          price: shipment_product.price,

          total_price: shipment_product.quantity * shipment_product.price,
          measurement_unit_name_ar:
            shipment_product.product_category_price.product_measurement
              .measurement_unit.name_ar,
          measurement_unit_name_en:
            shipment_product.product_category_price.product_measurement
              .measurement_unit.name_en,
        };
      },
    )),
      (this.warehouse = {
        id: shipments.warehouse.id,
        name_ar: shipments.warehouse.name_ar,
        name_en: shipments.warehouse.name_en,
        latitude: shipments.warehouse.latitude,
        longitude: shipments.warehouse.longitude,
      });

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
