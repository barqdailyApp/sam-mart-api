import { Expose, Type } from "class-transformer";
import { SupportTicketStatus } from "src/infrastructure/data/enums/support-ticket-status.enum";
import { RegisterResponse } from "src/modules/authentication/dto/responses/register.response";
import { TicketAttachmentResponse } from "./ticket-attachment.response";
import { ReasonResponse } from "src/modules/reason/dto/response/reasone.response";

export class SupportTicketResponse {
    @Expose() id: string;
    @Expose() @Type(() => ReasonResponse) subject: ReasonResponse;
    @Expose() description: string;
    @Expose() status: SupportTicketStatus;
    @Expose() ticket_num: string;
    @Expose() @Type(() => TicketAttachmentResponse) attachment: TicketAttachmentResponse;
    @Expose() created_at: Date;
    @Expose() updated_at: Date;
    @Expose() user_id: string;
    @Expose() new_messages_count: number;
    @Expose() @Type(() => RegisterResponse) user: RegisterResponse;
}