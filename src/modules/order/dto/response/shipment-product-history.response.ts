import { toUrl } from 'src/core/helpers/file.helper';
import { ShipmentProductActionType } from 'src/infrastructure/data/enums/shipment-product-action-type.enum';
import { ShipmentProductHistory } from 'src/infrastructure/entities/order/shipment-product-history.entity';

export class ShipmentProductHistoryResponse {
  id: string;
  modified_by: any;
  shipment_product: any;
  main_category: any;
  sub_category: any;
  created_at: Date;
  action_type: ShipmentProductActionType;
  constructor(shipmentProductHistory: ShipmentProductHistory) {
    this.id = shipmentProductHistory.id;
    this.modified_by = {
      id: shipmentProductHistory.modified_by.id,
      name: shipmentProductHistory.modified_by.name,
    };
    this.shipment_product = {
      id: shipmentProductHistory.shipment_product.id,
      product: {
        id: shipmentProductHistory.shipment_product.product.id,
        name_ar: shipmentProductHistory.shipment_product.product.name_ar,
        name_en: shipmentProductHistory.shipment_product.product.name_en,
        logo: toUrl(
          shipmentProductHistory.shipment_product.product.product_images.filter(
            (item) => item.is_logo === true,
          )[0].url,
        ),
        barcode: shipmentProductHistory.shipment_product.product.barcode,
      },

      main_category: {
        id: shipmentProductHistory.shipment_product.product_category_price
          .product_sub_category.category_subCategory.section_category.category
          .id,
        name_ar:
          shipmentProductHistory.shipment_product.product_category_price
            .product_sub_category.category_subCategory.section_category.category
            .name_ar,
        name_en:
          shipmentProductHistory.shipment_product.product_category_price
            .product_sub_category.category_subCategory.section_category.category
            .name_en,
      },
      sub_category: {
        id: shipmentProductHistory.shipment_product.product_category_price
          .product_sub_category.category_subCategory.subcategory.id,
        name_ar:
          shipmentProductHistory.shipment_product.product_category_price
            .product_sub_category.category_subCategory.subcategory.name_ar,
        name_en:
          shipmentProductHistory.shipment_product.product_category_price
            .product_sub_category.category_subCategory.subcategory.name_en,
      },
      price: shipmentProductHistory.price,
      quantity: shipmentProductHistory.quantity,
      total_price: shipmentProductHistory.total_price,
      main_measurement_unit: {
        id: shipmentProductHistory.shipment_product.main_measurement_unit.id,
        name_ar:
          shipmentProductHistory.shipment_product.main_measurement_unit.name_ar,
        name_en:
          shipmentProductHistory.shipment_product.main_measurement_unit.name_en,
      },
    };
    this.created_at = shipmentProductHistory.created_at;
    this.action_type = shipmentProductHistory.action_type;
  }
}
