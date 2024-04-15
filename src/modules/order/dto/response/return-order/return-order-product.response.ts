import { Expose, Type } from "class-transformer";
import { ShipmentProductResponse } from "../shipment-product.response";
import { ReasonResponse } from "src/modules/reason/dto/response/reasone.response";

export class ReturnOrderProductResponse {
    @Expose() id: string;
    @Expose() status: string;
    @Expose() quantity: number;
    @Expose() @Type(() => ShipmentProductResponse) shipmentProduct: ShipmentProductResponse;
    @Expose() shipment_product_id: string;
    @Expose() @Type(() => ReasonResponse) returnProductReason: ReasonResponse;
    @Expose() return_product_reason_id: string;
    @Expose() return_order_id: string;
} 