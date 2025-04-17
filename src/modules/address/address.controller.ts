import {
    BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { DeleteResult } from 'typeorm';
import { AddressService } from './address.service';
import { CreateAddressRequest } from './dto/requests/create-address.request';
import { AddressByAccountRequest } from './dto/requests/address-by-account.request';
import { UpdateAddressRequest } from './dto/requests/update-address.request';
import { AddressResponse } from './dto/responses/address.respone';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { RolesGuard } from '../authentication/guards/roles.guard';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { Roles } from '../authentication/guards/roles.decorator';
import { PaginatedResponse } from 'src/core/base/responses/paginated.response';
import { ActionResponse } from 'src/core/base/responses/action.response';
import { PaginatedRequest } from 'src/core/base/requests/paginated.request';
import { Address } from 'src/infrastructure/entities/user/address.entity';
import { Router } from 'src/core/base/router';

@ApiTags(Router.Addresses.ApiTag)
@ApiHeader({
  name: 'Accept-Language',
  required: false,
  description: 'Language header: en, ar',
})
@Controller(Router.Addresses.Base)
export class AddressController {
  constructor(private addressService: AddressService) {}
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CLIENT)
  @Get(Router.Addresses.List)
  async getAll(
    @Query() query?: PaginatedRequest,
  ): Promise<
    PaginatedResponse<AddressResponse[]> | ActionResponse<AddressResponse[]>
  > {
    const result = await this.addressService.findAll(query);
    const response = plainToInstance(AddressResponse, result, {
      excludeExtraneousValues: true,
    });
    if (query.page && query.limit) {
      const total = await this.addressService.count(query);
      return new PaginatedResponse<AddressResponse[]>(response, {
        meta: { total, ...query },
      });
    } else {
      return new ActionResponse<AddressResponse[]>(response);
    }
  }

  // @Get(Router.Addresses.ByAccount)
  // async getbyAccount(@Query() query: AddressByAccountRequest): Promise<ActionResponse<AddressResponse[]>> {
  //     const result = await this.addressService.findByAccount(query);
  //     const response = plainToInstance(AddressResponse, result, { excludeExtraneousValues: true });
  //     return new ActionResponse<AddressResponse[]>(response);
  // }
)
  @Get('/available-sections')
  async getBarqSections(
    @Query() query: CreateAddressRequest,
    @Query("user_id") user_id?: string,
   
  ) {
    const result = await this.addressService.getAvailableSections(query, user_id);
    return new ActionResponse(result);
  }
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CLIENT)
  @Get(Router.Addresses.Single)
  async getById(
    @Param('id') id: string,
  ): Promise<ActionResponse<AddressResponse>> {
    const result = await this.addressService.findOne(id);
    const response = plainToInstance(AddressResponse, result, {
      excludeExtraneousValues: true,
    });
    return new ActionResponse<AddressResponse>(response);
  }
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CLIENT)
  @Post(Router.Addresses.Create)
  async create(
    @Body() req: CreateAddressRequest,
  ): Promise<ActionResponse<AddressResponse>> {
    const data = plainToInstance(Address, req);
    const result = await this.addressService.create(data);
    const response = plainToInstance(AddressResponse, result, {
      excludeExtraneousValues: true,
    });
    return new ActionResponse<AddressResponse>(response);
  }

  @Post('validate')
  async validateAddress(
    @Body() req: CreateAddressRequest,
  ): Promise<ActionResponse<AddressResponse>> {
    const data = plainToInstance(Address, req);
    const result = await this.addressService.isLocationWithinWorkingArea(
      data.latitude,
      data.longitude,
    );
    if (result == false)
        throw new BadRequestException('message.invalid_location');
    const response = plainToInstance(AddressResponse, result, {
      excludeExtraneousValues: true,
    });
    return new ActionResponse<AddressResponse>(response);
  }
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CLIENT)
  @Put(Router.Addresses.Update)
  async update(
    @Body() req: UpdateAddressRequest,
  ): Promise<ActionResponse<AddressResponse>> {
    const data = plainToInstance(Address, req);
    const result = await this.addressService.update(data);
    const response = plainToInstance(AddressResponse, result, {
      excludeExtraneousValues: true,
    });
    return new ActionResponse<AddressResponse>(response);
  }
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CLIENT)
  @Put(Router.Addresses.SetFavorite)
  async setFavorite(
    @Param('id') id: string,
  ): Promise<ActionResponse<AddressResponse>> {
    const result = await this.addressService.setFavorite(id);
    const response = plainToInstance(AddressResponse, result, {
      excludeExtraneousValues: true,
    });
    return new ActionResponse<AddressResponse>(response);
  }
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CLIENT)
  @Put(Router.Addresses.RemoveFavorite)
  async removeFavorite(
    @Param('id') id: string,
  ): Promise<ActionResponse<AddressResponse>> {
    const result = await this.addressService.removeFavorite(id);
    const response = plainToInstance(AddressResponse, result, {
      excludeExtraneousValues: true,
    });
    return new ActionResponse<AddressResponse>(response);
  }
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CLIENT)
  @Delete(Router.Addresses.Delete)
  async delete(@Param('id') id: string): Promise<ActionResponse<DeleteResult>> {
    const result = await this.addressService.delete(id);
    const response = plainToInstance(DeleteResult, result);
    return new ActionResponse<DeleteResult>(response);
  }
}
