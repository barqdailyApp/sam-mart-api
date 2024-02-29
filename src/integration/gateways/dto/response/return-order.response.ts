import { Expose, Type } from "class-transformer";
import { OrderStatusChangeResponse } from "./order-status-change.response";

export class ReturnOrderResponse extends OrderStatusChangeResponse {
    @Expose() @Type(() => ReturnOrderRequest) returnOrder: ReturnOrderRequest;
}

class ReturnOrderRequest {
    @Expose() id: string;
    @Expose() status: string;
    @Expose() admin_note: string;
    @Expose() customer_note: string;
    @Expose() order_id: string;
}