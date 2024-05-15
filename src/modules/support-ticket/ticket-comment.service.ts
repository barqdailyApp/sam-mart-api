import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { BaseService } from 'src/core/base/service/service.base';
import { TicketComment } from 'src/infrastructure/entities/support-ticket/ticket-comment.entity';
import { FileService } from '../file/file.service';
import { SupportTicket } from 'src/infrastructure/entities/support-ticket/support-ticket.entity';
import { AddTicketCommentRequest } from './dto/request/add-ticket-comment.request';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { TicketAttachment } from 'src/infrastructure/entities/support-ticket/ticket-attachement.entity';
import { SupportTicketGateway } from 'src/integration/gateways/support-ticket.gateway';
import { GetCommentQueryRequest } from './dto/request/get-comment-query.request';
import { plainToInstance } from 'class-transformer';
import { UserResponse } from '../user/dto/responses/user.response';
import { NotificationService } from '../notification/notification.service';
import { NotificationEntity } from 'src/infrastructure/entities/notification/notification.entity';
import { NotificationTypes } from 'src/infrastructure/data/enums/notification-types.enum';
import { User } from 'src/infrastructure/entities/user/user.entity';

@Injectable()
export class TicketCommentService extends BaseService<TicketComment> {
  constructor(
    @InjectRepository(TicketComment)
    private readonly ticketCommentRepository: Repository<TicketComment>,
 
    @InjectRepository(TicketAttachment)
    private readonly ticketAttachmentRepository: Repository<TicketAttachment>,
    @InjectRepository(SupportTicket)
    private readonly supportTicketRepository: Repository<SupportTicket>,
    @Inject(REQUEST) private readonly request: Request,
    @Inject(FileService) private _fileService: FileService,
    private readonly supportTicketGateway: SupportTicketGateway,
    private readonly notificationService: NotificationService,
  ) {
    super(ticketCommentRepository);
  }

  async addComment(
    ticketId: string,
    { file, comment_text }: AddTicketCommentRequest,
  ): Promise<TicketComment> {
    let attachedFile = null;
    if (file) {
      const tempImage = await this._fileService.upload(file, `support-tickets`);

      const createAttachedFile = this.ticketAttachmentRepository.create({
        file_url: tempImage,
        file_name: file.originalname,
        file_type: file.mimetype,
      });
      attachedFile = await this.ticketAttachmentRepository.save(
        createAttachedFile,
      );
    }

    const ticket = await this.supportTicketRepository.findOne({
      where: { id: ticketId },
    });
    if (!ticket) throw new BadRequestException('Ticket not found');

    if (
      !this.currentUser.roles.includes(Role.ADMIN) &&
      ticket.user_id !== this.currentUser.id
    ) {
      throw new UnauthorizedException(
        'You are not allowed to add comment to this ticket',
      );
    }

    const newComment = await this.ticketCommentRepository.create({
      comment_text,
      user_id: this.currentUser.id,
      ticket,
      attachment: attachedFile,
    });

    if (
      ticket.is_counter_active &&
      !this.currentUser.roles.includes(Role.ADMIN)
    ) {
      ticket.new_messages_count++;
      await this.supportTicketRepository.save(ticket);
    }

    const savedComment = await this.ticketCommentRepository.save(newComment);
    const userInfo = plainToInstance(UserResponse, this.currentUser, {
      excludeExtraneousValues: true,
    });

    this.supportTicketGateway.handleSendMessage({
      supportTicket: ticket,
      ticketComment: savedComment,
      user: userInfo,
      action: 'ADD_COMMENT',
    });

    if (this.currentUser.id !== ticket.user_id) {
      await this.notificationService.create(
        new NotificationEntity({
          user_id: ticket.user_id,
          url: savedComment.ticket_id,
          type: NotificationTypes.TICKET,
          title_ar: 'دعم فنى',
          title_en: 'Support',
          text_ar: newComment.comment_text,
          text_en: newComment.comment_text,
        }),
      );
    }


    return savedComment;
  }

  async getCommentsByChunk(
    ticketId: string,
    query: GetCommentQueryRequest,
  ): Promise<TicketComment[]> {
    const { limit = 10, offset = 0 } = query;

    const supportTicket = await this.supportTicketRepository.findOne({
      where: { id: ticketId },
    });
    if (!supportTicket) throw new BadRequestException('Ticket not found');

    if (
      !this.currentUser.roles.includes(Role.ADMIN) &&
      supportTicket.user_id !== this.currentUser.id
    ) {
      throw new UnauthorizedException(
        'You are not allowed to view this ticket',
      );
    }

    // if the user is admin, then we will reset the new messages count
    if (this.currentUser.roles.includes(Role.ADMIN)) {
      supportTicket.is_counter_active = false;
      supportTicket.new_messages_count = 0;
      await this.supportTicketRepository.save(supportTicket);
    }

    return await this.ticketCommentRepository.find({
      where: { ticket_id: ticketId },
      relations: ['user', 'attachment'],
      order: { created_at: 'DESC' },
      skip: offset,
      take: limit,
    });
  }

  get currentUser() {
    return this.request.user;
  }
}
