import { Expose, Type } from "class-transformer";
import { RegisterResponse } from "src/modules/authentication/dto/responses/register.response";
import { TicketAttachmentResponse } from "src/modules/support-ticket/dto/response/ticket-attachment.response";

export class ShipmentMessageResponse {
    @Expose() id: string;
    @Expose() message: string;
    @Expose() @Type(() => TicketAttachmentResponse) attachment: TicketAttachmentResponse;
    @Expose() created_at: Date;
    @Expose() updated_at: Date;
    @Expose() user_id: string;
    @Expose() shipment_id: string;
    @Expose() @Type(() => RegisterResponse) user: RegisterResponse;
}