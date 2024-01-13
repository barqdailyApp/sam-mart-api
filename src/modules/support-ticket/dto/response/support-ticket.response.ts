import { Expose, Type } from "class-transformer";
import { SupportTicketStatus } from "src/infrastructure/data/enums/support-ticket-status.enum";
import { RegisterResponse } from "src/modules/authentication/dto/responses/register.response";
import { TicketAttachmentResponse } from "./ticket-attachment.response";

export class SupportTicketResponse {
    @Expose() id: string;
    @Expose() subject: string;
    @Expose() description: string;
    @Expose() status: SupportTicketStatus;
    @Expose() ticket_num: string;
    @Expose() @Type(() => TicketAttachmentResponse) attachment: TicketAttachmentResponse;
    @Expose() created_at: Date;
    @Expose() updated_at: Date;
    @Expose() user_id: string;
    @Expose() @Type(() => RegisterResponse) user: RegisterResponse;

}