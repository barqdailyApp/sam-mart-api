import { Exclude, Expose } from 'class-transformer';
import { toUrl } from 'src/core/helpers/file.helper';
import { DeliveryType } from 'src/infrastructure/data/enums/delivery-type.enum';
import { PaymentMethodEnum } from 'src/infrastructure/data/enums/payment-method';
import { Order } from 'src/infrastructure/entities/order/order.entity';

@Exclude()
export class OrderSingleResponse {
  @Expose() order_id: string;
  @Expose() created_at: Date;
  @Expose() order_number: string;

  @Expose() total_price: number;
  @Expose() delivery_fee: number;
@Expose()  estimated_delivery_time:Date
  @Expose() order_products: number;
  @Expose() promo_code_discount: number;
  @Expose() address: any;
  @Expose() shipments: any;
  @Expose() products_price:number

  constructor(order: Order) {
    this.order_id = order.id;
    this.created_at = order.created_at;
    this.estimated_delivery_time = order.estimated_delivery_time;
    this.delivery_fee = order.delivery_fee;
    this.order_number = order.number;
    this.products_price=order.products_price;
    this.order_products = order.shipments[0].shipment_products.length;
    this.total_price = order.total_price;
    this.promo_code_discount = order.promo_code_discount;
    this.shipments = {
      id: order.shipments[0].id,
      order_id: order.shipments[0].order_id,
      driver: order.shipments[0].driver_id
        ? {
            id: order.shipments[0].driver.id,
            username: order.shipments[0].driver.user.name,
            phone: order.shipments[0].driver.user.phone,
            avatar: toUrl(order.shipments[0].driver.user.avatar),
            latitude: order.shipments[0].driver.latitude,
            longitude: order.shipments[0].driver.longitude,
          }
        : null,
      status: order.shipments[0].status,
      order_confirmed_at: order.shipments[0].order_confirmed_at,
      order_on_processed_at: order.shipments[0].order_on_processed_at,
      order_shipped_at: order.shipments[0].order_shipped_at,
      order_delivered_at: order.shipments[0].order_delivered_at,
      order_canceled_at: order.shipments[0].order_canceled_at,
      canceled_by: order.shipments[0]?.canceled_by,
      shipment_feedback: order.shipments[0].order_feedback
        ? {
            id: order.shipments[0].order_feedback.id,
            communication: order.shipments[0].order_feedback.communication,
            packaging: order.shipments[0].order_feedback.packaging,
            delivery_time: order.shipments[0].order_feedback.delivery_time,
            client_id: order.shipments[0].order_feedback.user_id,
            driver_id: order.shipments[0].order_feedback.driver_id,
            shipment_id: order.shipments[0].order_feedback.shipment_id,
          }
        : null,
      shipment_products: order.shipments[0].shipment_products.map(
        (shipment_product) => {
          const cart_products =
            shipment_product.product_category_price.cart_products;
          const product =
            shipment_product.product_category_price.product_sub_category
              .product;
          const product_offer =
            shipment_product.product_category_price.product_offer;
          return {
            id: shipment_product.id,
            shipment_id: shipment_product.shipment_id,
            product_id: shipment_product.product_id,
            can_return: shipment_product.can_return,

            product_category_price_id:
              shipment_product.product_category_price.id,
            quantity: shipment_product.quantity,
            warehouse_quantity:
              product.warehouses_products.reduce(
                (acc, cur) => acc + cur.quantity,
                0,
              ) /
              shipment_product.product_category_price.product_measurement
                .conversion_factor,

            product_price: shipment_product.price,
            product_name_ar:
              shipment_product.product_category_price.product_sub_category
                .product.name_ar,
            product_name_en:
              shipment_product.product_category_price.product_sub_category
                .product.name_en,
            product_logo: toUrl(
              product.product_images.find((x) => x.is_logo === true).url,
            ),
            total_price: shipment_product.quantity * shipment_product.price,
            row_number:shipment_product.product_category_price.product_sub_category.product.row_number,
            min_order_quantity:
              product_offer != null
                ? product_offer.min_offer_quantity
                : shipment_product.product_category_price.min_order_quantity,

            max_order_quantity:
              product_offer != null
                ? product_offer.max_offer_quantity
                : shipment_product.product_category_price.min_order_quantity,

            product_measurement_id:
              shipment_product.product_category_price.product_measurement.id,
            measurement_unit_id:
              shipment_product.product_category_price.product_measurement
                .measurement_unit.id,
            measurement_unit_ar:
              shipment_product.product_category_price.product_measurement
                .measurement_unit.name_ar,
            measurement_unit_en:
              shipment_product.product_category_price.product_measurement
                .measurement_unit.name_en,
            cart_products:
              cart_products == undefined || cart_products.length == 0
                ? null
                : {
                    id: cart_products[0].id,
                    warehouse_quantity:
                      product.warehouses_products.reduce(
                        (acc, cur) => acc + cur.quantity,
                        0,
                      ) / cart_products[0].conversion_factor,
                    cart_id: cart_products[0].cart_id,
                    product_id: cart_products[0].product_id,
                    quantity: cart_products[0].quantity,
                    min_order_quantity: product_offer
                      ? product_offer.min_offer_quantity
                      : shipment_product.product_category_price
                          .min_order_quantity,
                    max_order_quantity: product_offer
                      ? product_offer.max_offer_quantity
                      : shipment_product.product_category_price
                          .max_order_quantity,
                    price: cart_products[0].price,
                    additions: cart_products[0].additions,
                  },
          };
        },
      ),
    };
  }
}
