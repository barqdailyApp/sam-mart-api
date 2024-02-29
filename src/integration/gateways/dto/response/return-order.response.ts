import { Expose, Type } from "class-transformer";
import { OrderStatusChangeResponse } from "./order-status-change.response";

class ReturnOrderRequest {
    @Expose() id: string;
    @Expose() status: string;
    @Expose() admin_note: string;
    @Expose() customer_note: string;
    @Expose() order_id: string;
}

export class ReturnOrderResponse extends OrderStatusChangeResponse {
    @Expose() @Type(() => ReturnOrderRequest) returnOrder: ReturnOrderRequest;
}