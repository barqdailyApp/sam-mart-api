import { Exclude, Expose } from 'class-transformer';
import { toUrl } from 'src/core/helpers/file.helper';
import { DeliveryType } from 'src/infrastructure/data/enums/delivery-type.enum';
import { PaymentMethodEnum } from 'src/infrastructure/data/enums/payment-method';
import { Order } from 'src/infrastructure/entities/order/order.entity';

@Exclude()
export class OrderSingleDashboardResponse {
  @Expose() order_id: string;
  @Expose() slot_id: string;
  @Expose() section: any;
  @Expose() order_created_at: Date;

  @Expose() order_number: string;
  @Expose() transaction_number: string;

  @Expose() delivery_type: DeliveryType;

  @Expose() total_price: number;
  @Expose() payment_method: PaymentMethodEnum;
  @Expose() is_paid: boolean;
  @Expose() delivery_day: string;
  @Expose() delivery_fee: number;
  @Expose() order_products: number;

  @Expose() warehouse: any;
  @Expose() user: any;
  @Expose() address: any;
  @Expose() shipments: any;
  @Expose() promo_code_discount: number;

  constructor(order: Order) {
    this.order_id = order.id;
    this.slot_id = order.slot_id;
    this.promo_code_discount = order.promo_code_discount;
    this.section = {
      id: order.section.id,
      name_ar: order.section.name_ar,
      name_en: order.section.name_en,
    };
    this.order_created_at = order.created_at;
    this.order_number = order.number;
    this.transaction_number = order.transaction_number;

    this.order_products = order.shipments[0].shipment_products.length;
    this.total_price = order.total_price;
    this.payment_method = order.payment_method;
    this.is_paid = order.is_paid;
    this.delivery_day = order.delivery_day;
    this.delivery_type = order.delivery_type;
    this.delivery_fee = order.delivery_fee;

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
      driver: order.shipments[0].driver_id
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
      shipment_products: order.shipments[0].shipment_products.map(
        (shipment_product) => {
          return {
            id: shipment_product.id,
            shipment_id: shipment_product.shipment_id,
            product_id: shipment_product.product_id,
            barcode:  shipment_product.product_category_price.product_sub_category
            .product.barcode,
            quantity: shipment_product.quantity,
            price: shipment_product.price,
            product_name_ar:
              shipment_product.product_category_price.product_sub_category
                .product.name_ar,
            product_name_en:
              shipment_product.product_category_price.product_sub_category
                .product.name_en,
            product_logo: toUrl(
              shipment_product.product_category_price.product_sub_category.product.product_images.find(
                (product_image) => product_image.is_logo === true,
              ).url,
            ),
            total_price: shipment_product.quantity * shipment_product.price,
            sub_category_name_ar:
              shipment_product.product_category_price.product_sub_category
                .category_subCategory.subcategory.name_ar,
            sub_category_name_en:
              shipment_product.product_category_price.product_sub_category
                .category_subCategory.subcategory.name_en,
            category_name_ar:
              shipment_product.product_category_price.product_sub_category
                .category_subCategory.section_category.category.name_ar,
            category_name_en:
              shipment_product.product_category_price.product_sub_category
                .category_subCategory.section_category.category.name_en,
          };
        },
      ),
    };
  }
}
