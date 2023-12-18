import { Controller, Get, Inject, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { Roles } from '../authentication/guards/roles.decorator';
import { RolesGuard } from '../authentication/guards/roles.guard';
import { OrderInvoiceService } from './order-invoice.service';
import { OrderInvoice } from 'src/infrastructure/entities/order/order-invoice.entity';
import { ActionResponse } from 'src/core/base/responses/action.response';
import { I18nResponse } from 'src/core/helpers/i18n.helper';
@ApiBearerAuth()
@ApiHeader({
  name: 'Accept-Language',
  required: false,
  description: 'Language header: en, ar',
})
@ApiTags('order-invoice')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.CLIENT)
@Controller('order-invoice')
export class OrderInvoiceController {
  constructor(
    private readonly orderInvoiceService: OrderInvoiceService,
    @Inject(I18nResponse) private readonly _i18nResponse: I18nResponse,
  ) {}

  @Get()
  async getAllOrderInvoices() {
    const get_order_invoices =
      await this.orderInvoiceService.getAllOrderInvoices();
    const order_invoice_res = this._i18nResponse.entity(get_order_invoices);

    return new ActionResponse<OrderInvoice[]>(order_invoice_res);
  }
  @Get(':id/get-order-invoice')
  async getSingleOrderInvoice(@Param('id') id: string) {
    const get_order_invoice =
      await this.orderInvoiceService.getSingleOrderInvoice(id);
      const order_invoice_res = this._i18nResponse.entity(get_order_invoice);

    return new ActionResponse<OrderInvoice>(order_invoice_res);
  }
}
