import { Expose } from "class-transformer";

export class SupportTicketSubjectResponse {
    @Expose() id: string;
    @Expose() title: string;
}