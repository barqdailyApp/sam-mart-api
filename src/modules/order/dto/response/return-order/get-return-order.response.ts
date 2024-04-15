import { Expose, Type } from "class-transformer";
import { OrderResponse } from "../order.response";
import { ReturnOrderProductResponse } from "./return-order-product.response";
import { DriverClientResponse } from "src/modules/driver/response/driver-client.response";

export class GetReturnOrderResponse {
    @Expose() id: string;
    @Expose() return_number: string;
    @Expose() status: string;
    @Expose() admin_note: string;
    @Expose() customer_note: string;
    @Expose() @Type(() => OrderResponse) order: OrderResponse;
    @Expose() @Type(() => ReturnOrderProductResponse) returnOrderProducts: ReturnOrderProductResponse[];
    @Expose() @Type(() => DriverClientResponse) driver: DriverClientResponse;
    @Expose() request_accepted_at: Date;
    @Expose() created_at: Date;
    @Expose() updated_at: Date;
}