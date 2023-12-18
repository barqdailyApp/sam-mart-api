
import {
    Body,
    Controller,
    Delete,
    Get,
    Inject,
    Param,
    Post,
    Put,
    UseGuards,
  } from '@nestjs/common';
  import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
  import { ActionResponse } from 'src/core/base/responses/action.response';
  import { DeleteResult } from 'typeorm';
  import { Role } from 'src/infrastructure/data/enums/role.enum';
  import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
  import { Roles } from '../authentication/guards/roles.decorator';
  import { RolesGuard } from '../authentication/guards/roles.guard';
import { SupportService } from './support.service';
import { Support } from 'src/infrastructure/entities/support/support.entity';
import { UpdateSupportRequest } from './dto/update-support.request';
  @ApiBearerAuth()
  @ApiHeader({
    name: 'Accept-Language',
    required: false,
    description: 'Language header: en, ar',
  })
  @ApiTags('Support')
  @Controller('support')
  export class SupportController {
    constructor(
      private readonly supportService: SupportService,
    ) {}
  
    @Get()
    async getSupport() {
      const supportData =
        await this.supportService.getSupport();

      return new ActionResponse<Support>(supportData);
    }
  
  
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Put(':id/update-support')
    async updateSupport(
      @Param('id') id: string,
      @Body() updateSupportRequest: UpdateSupportRequest,
    ) {
      const supportData =
        await this.supportService.UpdateSupport(
          id,
          updateSupportRequest,
        );

      return new ActionResponse<Support>(supportData);
    }
  
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Delete(':id/support')
    async deleteSupport(@Param('id') id: string) {
      const delete_support =
        await this.supportService.deleteSupport(id);
  
      return new ActionResponse<DeleteResult>(delete_support);
    }
  }
  