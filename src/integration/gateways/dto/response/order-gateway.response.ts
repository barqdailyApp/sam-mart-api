import { Expose, Type } from "class-transformer";
import { DeliveryType } from "src/infrastructure/data/enums/delivery-type.enum";
import { PaymentMethod } from "src/infrastructure/data/enums/payment-method";
import { ShipmentStatusEnum } from "src/infrastructure/data/enums/shipment_status.enum";
import { AddressResponse } from "src/modules/address/dto/responses/address.respone";

export class OrderGatewayResponse {
    @Expose() id: string;
    @Expose() total_price: number;
    @Expose() payment_method: PaymentMethod;
    @Expose() is_paid: boolean;
    @Expose() delivery_type: DeliveryType;
    @Expose() estimated_delivery_time: Date;
    @Expose() slot_id: string;
    @Expose() delivery_day: string;
    @Expose() @Type(() => AddressResponse) address: AddressResponse;
    @Expose() shipment_id: string;
    @Expose() number: string;
    @Expose() delivery_fee: number;
    @Expose() status: ShipmentStatusEnum;
    @Expose() status_reason: string;
    @Expose() order_confirmed_at: Date;
    @Expose() order_on_processed_at: Date;
    @Expose() order_shipped_at: Date;
    @Expose() order_delivered_at: Date;
}