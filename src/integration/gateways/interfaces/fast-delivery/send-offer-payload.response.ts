import { ShipmentStatusEnum } from "src/infrastructure/data/enums/shipment_status.enum";
import { Order } from "src/infrastructure/entities/order/order.entity";
import { Shipment } from "src/infrastructure/entities/order/shipment.entity";

export interface SendOfferToDriver {
    action: string;
    shipment: Shipment;
}
