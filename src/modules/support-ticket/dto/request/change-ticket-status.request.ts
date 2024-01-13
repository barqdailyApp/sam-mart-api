import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty } from "class-validator";
import { SupportTicketStatus } from "src/infrastructure/data/enums/support-ticket-status.enum";

export class ChangeTicketStatusRequest {
    @ApiProperty({
        nullable: true,
        required: false,
        enum: [
          SupportTicketStatus.OPEN,
          SupportTicketStatus.IN_PROGRESS,
          SupportTicketStatus.RESOLVED,
          SupportTicketStatus.CLOSED,
          SupportTicketStatus.CANCELLED,
        ],
      })
      @IsNotEmpty()
      @IsEnum(SupportTicketStatus)
      status: string;
    

}