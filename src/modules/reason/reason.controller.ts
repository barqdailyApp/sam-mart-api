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
    Query,
    Patch,
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
import { GetReasonQueryRequest } from './dto/request/get-reason-query.requst';
import { UpdateReasonRequest } from './dto/request/update-reason.request';
import { PaginatedResponse } from 'src/core/base/responses/paginated.response';
import { GetReasonByNameQueryRequest } from './dto/request/get-reason-by-name-query.request';
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
        private readonly reasonService: ReasonService,
        private readonly _i18nResponse: I18nResponse,
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

    @Get("all")
    async getAllReasons(
        @Query() query: GetReasonQueryRequest
    ): Promise<ActionResponse<Reason[]>> {
        const { reasons, total } = await this.reasonService.getAll(query);
        return new PaginatedResponse<Reason[]>(this._i18nResponse.entity(reasons), {
            meta: { total, page: query.page, limit: query.limit },
        });
    }

    @Get("signle-reason/:id")
    async getSingleReason(
        @Param('id') id: string
    ): Promise<ActionResponse<Reason>> {
        return new ActionResponse<Reason>(
            await this.reasonService.getSingleReason(id)
        );
    }

    @Get("get-reasons-by-name")
    @Roles(Role.ADMIN)
    async getReasonByName(
        @Query() query: GetReasonByNameQueryRequest
    ): Promise<ActionResponse<Reason[]>> {
        const [reasons, count] = await this.reasonService.getReasonByName(query)
        return new PaginatedResponse<Reason[]>(reasons, {
            meta: { total: count, page: query.page, limit: query.limit }
        });
    }

    @Patch("update/:id")
    @Roles(Role.ADMIN)
    async updateReason(
        @Param('id') id: string,
        @Body() req: UpdateReasonRequest
    ): Promise<ActionResponse<Reason>> {
        return new ActionResponse<Reason>(
            await this.reasonService.updateReason(id, req)
        );
    }

    @Delete("delete/:id")
    @Roles(Role.ADMIN)
    async deleteReason(
        @Param('id') id: string
    ): Promise<ActionResponse<Boolean>> {
        return new ActionResponse<Boolean>(
            await this.reasonService.deleteReason(id)
        );
    }
}
