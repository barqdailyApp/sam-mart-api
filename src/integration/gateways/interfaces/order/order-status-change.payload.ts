import { ShipmentStatusEnum } from "src/infrastructure/data/enums/shipment_status.enum";
import { Driver } from "src/infrastructure/entities/driver/driver.entity";
import { Order } from "src/infrastructure/entities/order/order.entity";
import { Shipment } from "src/infrastructure/entities/order/shipment.entity";
import { User } from "src/infrastructure/entities/user/user.entity";
import { Warehouse } from "src/infrastructure/entities/warehouse/warehouse.entity";

/**
 * @interface OrderStatusChangePayload
 * @description The payload to be sent when the order status changes
 * @param action The action to be performed
 * @param to_rooms The rooms to send the payload to driver_id, warehouse_id, user_id, admin
 * @param body The body of the payload
 * @param body.warehouse The warehouse
 * @param body.order The order
 * @param body.shipment The shipment
 * @param body.driver The driver
 * @param body.client The client
 */
export interface OrderStatusChangePayload {
    action: ShipmentStatusEnum | 'ASSIGNED';
    to_rooms: string[];
    body: {
        warehouse: Warehouse,
        order: Order;
        shipment: Shipment;
        driver: Driver;
        client: User;
    }
}