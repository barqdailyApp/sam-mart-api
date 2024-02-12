import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartRequest } from './dto/requests/add-to-cart-request';
import { plainToInstance } from 'class-transformer';
import { CartProduct } from 'src/infrastructure/entities/cart/cart-products';
import { ApiTags, ApiHeader, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { RolesGuard } from '../authentication/guards/roles.guard';
import { CartProductRespone } from './dto/respone/cart-product-repspone';
import { I18nResponse } from 'src/core/helpers/i18n.helper';
import { ActionResponse } from 'src/core/base/responses/action.response';
import { UpdateCartProductRequest } from './dto/requests/update-cart-request';
import { AddRemoveCartProductServiceRequest } from './dto/requests/add-remove-service-request';

@ApiTags('Cart')
@ApiHeader({
  name: 'Accept-Language',
  required: false,
  description: 'Language header: en, ar',
})
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('cart')
export class CartController {
  constructor(
    private readonly _i18nResponse: I18nResponse,
    private readonly cartService: CartService,
  ) {}

  @Get()
  async getCartProducts() {
    const cart = await this.cartService.getCart();
    const cart_products = this._i18nResponse.entity(
      await this.cartService.getCartProducts(cart.id),
    );

    return new ActionResponse(
      cart_products.map(
        (e) =>
          new CartProductRespone({
            id: e.id,
            additional_services: e.additions,
            price: e.price,
            quantity: e.quantity,
            product: e.product_category_price,
          }),
      ),
    );
  }

  @Post('/add')
  async createCart(@Body() req: AddToCartRequest) {
    const cart_product = await this.cartService.addToCart(req);
    if (!cart_product) throw new BadRequestException();
    const result = this._i18nResponse.entity(
      await this.cartService.getSingleCartProduct(cart_product.id),
    );

    const response = new CartProductRespone({
      id: result.id,
      additional_services: result.additions,
      price: result.price,
      quantity: result.quantity,
      product: result.product_category_price,
    });

    return new ActionResponse(response);
  }

  @Delete('/delete/:cart_product_id')
  async deleteCartProduct(@Param('cart_product_id') cart_product_id: string) {
    const cart_product = await this.cartService.deleteCartProduct(
      cart_product_id,
    );
    return new ActionResponse(
      this._i18nResponse.entity(
        new CartProductRespone({
          id: cart_product.id,
          additional_services: cart_product.additions,
          price: cart_product.price,
          quantity: cart_product.quantity,
          product: cart_product.product_category_price,
        }),
      ),
    );
  }

  @Put('/update/:cart-product')
  async updateCartProduct(@Body() req: UpdateCartProductRequest) {
    return new ActionResponse(await this.cartService.updatecartProduct(req));
  }

  @Put('/update/:cart-product/service')
  async addRemoveService(@Body() req: AddRemoveCartProductServiceRequest) {
    return new ActionResponse(await this.cartService.addRemoveService(req));
  }
}
