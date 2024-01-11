import { Expose, Transform } from "class-transformer";
import { toUrl } from "src/core/helpers/file.helper";

export class TicketAttachmentResponse {
    @Expose() id: string;
    @Expose() @Transform(({ value }) => toUrl(value)) file_url: string;
    @Expose() file_name: string;
    @Expose() file_type: string;
    @Expose() created_at: Date;
    @Expose() updated_at: Date;
}