import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupportTicket } from 'src/infrastructure/entities/support-ticket/support-ticket.entity';
import { BaseService } from 'src/core/base/service/service.base';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { CreateTicketRequest } from './dto/request/create-ticket.request';
import { FileService } from '../file/file.service';
import { PaginatedRequest } from 'src/core/base/requests/paginated.request';
import { SupportTicketStatus } from 'src/infrastructure/data/enums/support-ticket-status.enum';
import { TicketAttachment } from 'src/infrastructure/entities/support-ticket/ticket-attachement.entity';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { TicketCommentService } from './ticket-comment.service';
import { ReasonService } from '../reason/reason.service';
import { ReasonType } from 'src/infrastructure/data/enums/reason-type.enum';


@Injectable()
export class SupportTicketService extends BaseService<SupportTicket> {
    constructor(
        @InjectRepository(SupportTicket) private readonly supportTicketRepository: Repository<SupportTicket>,
        @InjectRepository(TicketAttachment) private readonly ticketAttachmentRepository: Repository<TicketAttachment>,

        @Inject(REQUEST) private readonly request: Request,
        @Inject(FileService) private _fileService: FileService,
        @Inject(ReasonService) private readonly reasonService: ReasonService,

        private readonly ticketCommentService: TicketCommentService,

    ) {
        super(supportTicketRepository);
    }

    async createTicket({ subject_id, description, file }: CreateTicketRequest) {

        let attachedFile = null;
        if (file) {
            const tempImage = await this._fileService.upload(
                file,
                `support-tickets`,
            );

            const createAttachedFile = this.ticketAttachmentRepository.create({
                file_url: tempImage,
                file_name: file.originalname,
                file_type: file.mimetype,
            })
            attachedFile = await this.ticketAttachmentRepository.save(createAttachedFile);
        }

        const subject = await this.reasonService.findOne({ id: subject_id, type: ReasonType.SUPPORT_TICKET });
        if (!subject) throw new BadRequestException('Subject not found');

        const newTicket = await this.supportTicketRepository.create({
            subject,
            description,
            user: this.currentUser,
            attachment: attachedFile
        });

        const savedTicket = await this.supportTicketRepository.save(newTicket);
        await this.ticketCommentService.addComment(savedTicket.id, {
            comment_text: description ?? subject.name_en,
            file: file ?? null
        });

        return savedTicket;
    }

    async getTickets(options?: PaginatedRequest) {
        options.filters ??= [];
        options.includes ??= [];

        options.includes.push('subject');
        options.includes.push('attachment');

        if (this.currentUser.roles.includes(Role.ADMIN)) {
            options.includes.push('user');
        } else {
            options.filters.push(`user_id=${this.currentUser.id}`);
        }

        return await this.findAll(options);
    }

    async chnageTicketStatus(ticketId: string, status: SupportTicketStatus) {
        const ticket = await this.supportTicketRepository.findOne({ where: { id: ticketId } });
        if (!ticket) throw new BadRequestException('Ticket not found');

        ticket.status = status;
        return await this.supportTicketRepository.save(ticket);
    }

    get currentUser() {
        return this.request.user;
    }
}