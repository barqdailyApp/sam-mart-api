import {
    Body,
    Controller,
    Get,
    Post,
    UseGuards,
    Param,
    Put,
    Delete,
    Inject,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiHeader } from '@nestjs/swagger';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { RolesGuard } from '../authentication/guards/roles.guard';
import { plainToClass } from 'class-transformer';
import { I18nResponse } from 'src/core/helpers/i18n.helper';
import { ActionResponse } from 'src/core/base/responses/action.response';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { Roles } from '../authentication/guards/roles.decorator';
import { CreateReasonRequest } from './dto/request/create-reason.request';
import { ReasonService } from './reason.service';
import { Reason } from 'src/infrastructure/entities/reason/reason.entity';
@ApiBearerAuth()
@ApiHeader({
    name: 'Accept-Language',
    required: false,
    description: 'Language header: en, ar',
})
@ApiTags('reason')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reason')
export class ReasonController {
    constructor(
        private readonly reasonService: ReasonService
    ) { }

    @Post("create")
    @Roles(Role.ADMIN)
    async createReason(
        @Body() req: CreateReasonRequest,
    ): Promise<ActionResponse<Reason>> {
        return new ActionResponse<Reason>(
            await this.reasonService.createReason(req)
        );
    }

}
