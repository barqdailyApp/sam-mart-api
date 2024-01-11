import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    Get,
    Param,
    Post,
    Put,
    Query,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { RolesGuard } from '../authentication/guards/roles.guard';
import { ApiBearerAuth, ApiConsumes, ApiHeader, ApiTags } from '@nestjs/swagger';
import { SupportTicketService } from './support-ticket.service';
import { CreateTicketRequest } from './dto/request/create-ticket.request';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadValidator } from 'src/core/validators/upload.validator';
import { ActionResponse } from 'src/core/base/responses/action.response';
import { SupportTicketResponse } from './dto/response/support-ticket.response';
import { plainToInstance } from 'class-transformer';
import { PaginatedRequest } from 'src/core/base/requests/paginated.request';
import { TicketCommentService } from './ticket-comment.service';
import { AddTicketCommentRequest } from './dto/request/add-ticket-comment.request';
import { TicketCommentResponse } from './dto/response/ticket-comment.response';
import { ChangeTicketStatusRequest } from './dto/request/change-ticket-status.request';
import { SupportTicketStatus } from 'src/infrastructure/data/enums/support-ticket-status.enum';
import { Roles } from '../authentication/guards/roles.decorator';
import { Role } from 'src/infrastructure/data/enums/role.enum';

@ApiBearerAuth()
@ApiHeader({
    name: 'Accept-Language',
    required: false,
    description: 'Language header: en, ar',
})
@ApiTags('Support Ticket')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('support-ticket')
export class SupportTicketController {
    constructor(
        private readonly supportTicketService: SupportTicketService,
        private readonly ticketCommentService: TicketCommentService
    ) { }

    @Post()
    @UseInterceptors(ClassSerializerInterceptor, FileInterceptor('file'))
    @ApiConsumes('multipart/form-data')
    async createTicket(
        @Body() createTicketRequest: CreateTicketRequest,
        @UploadedFile(new UploadValidator().build()) file: Express.Multer.File,
    ): Promise<ActionResponse<SupportTicketResponse>> {
        createTicketRequest.file = file;
        const createdTicket = await this.supportTicketService.createTicket(createTicketRequest);
        const result = plainToInstance(SupportTicketResponse, createdTicket, {
            excludeExtraneousValues: true,
        });
        return new ActionResponse<SupportTicketResponse>(result);
    }

    @Get()
    async getTickets(@Query() query: PaginatedRequest): Promise<ActionResponse<SupportTicketResponse[]>> {
        const tickets = await this.supportTicketService.getTickets(query);
        const result = plainToInstance(SupportTicketResponse, tickets, {
            excludeExtraneousValues: true,
        });
        return new ActionResponse<SupportTicketResponse[]>(result);
    }

    @Post('/comment/:ticketId')
    @UseInterceptors(ClassSerializerInterceptor, FileInterceptor('file'))
    @ApiConsumes('multipart/form-data')
    async addComment(
        @Param('ticketId') ticketId: string,
        @Body() addTicketCommentRequest: AddTicketCommentRequest,
        @UploadedFile(new UploadValidator().build()) file: Express.Multer.File,
    ): Promise<ActionResponse<TicketCommentResponse>> {
        addTicketCommentRequest.file = file;
        const createdComment = await this.ticketCommentService.addComment(ticketId, addTicketCommentRequest);
        const result = plainToInstance(TicketCommentResponse, createdComment, {
            excludeExtraneousValues: true,
        });
        return new ActionResponse<TicketCommentResponse>(result);
    }

    @Get('/comments/:ticketId/:offset/:limit')
    async getComments(
        @Param('ticketId') ticketId: string,
        @Param("offset") offset: number,
        @Param("limit") limit: number
    ): Promise<ActionResponse<TicketCommentResponse[]>> {
        const comments = await this.ticketCommentService.getCommentsByChunk(ticketId, offset, limit);
        const result = plainToInstance(TicketCommentResponse, comments, {
            excludeExtraneousValues: true,
        });
        return new ActionResponse<TicketCommentResponse[]>(result);
    }

    @Roles(Role.ADMIN)
    @Put('/ticket-status/:ticketId')
    async changeTicketStatus(
        @Param('ticketId') ticketId: string,
        @Body() chnageticketTicketStatusRequest: ChangeTicketStatusRequest
    ): Promise<ActionResponse<SupportTicketResponse>> {
        const ticket = await this.supportTicketService.chnageTicketStatus(ticketId, chnageticketTicketStatusRequest.status as SupportTicketStatus);
        const result = plainToInstance(SupportTicketResponse, ticket, {
            excludeExtraneousValues: true,
        });
        return new ActionResponse<SupportTicketResponse>(result);
    }
}