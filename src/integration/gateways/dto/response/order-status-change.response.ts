import { Expose, Type } from "class-transformer";
import { DriverResponse } from "src/modules/driver/response/driver.response";
import { UserResponse } from "src/modules/user/dto/responses/user.response";
import { WarehouseResponse } from "src/modules/warehouse/dto/response/warehouse.response";
import { OrderGatewayResponse } from "./order-gateway.response";

class WarehouseGatewayResponse extends WarehouseResponse {
    @Expose() name: string;
}

export class OrderStatusChangeResponse {
    @Expose() action: string;
    @Expose() @Type(() => UserResponse) client: UserResponse;
    @Expose() @Type(() => DriverResponse) driver: DriverResponse;
    @Expose() @Type(() => WarehouseGatewayResponse) warehouse: WarehouseGatewayResponse;
    @Expose() @Type(() => OrderGatewayResponse) order: OrderGatewayResponse;
}