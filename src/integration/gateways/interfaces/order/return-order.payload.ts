import { ReturnOrder } from "src/infrastructure/entities/order/return-order/return-order.entity";
import { Warehouse } from "src/infrastructure/entities/warehouse/warehouse.entity";
import { Shipment } from "src/infrastructure/entities/order/shipment.entity";
import { User } from "src/infrastructure/entities/user/user.entity";
import { Driver } from "src/infrastructure/entities/driver/driver.entity";
import { Order } from "src/infrastructure/entities/order/order.entity";

export interface ReturnOrderPayload {
    to_rooms: string[]
    body: {
        warehouse: Warehouse,
        order: Order;
        driver: Driver; // this for the new driver who will be assigned to get the returned order in case it's accepted
        client: User;
        returnOrder: ReturnOrder;
    }
}
