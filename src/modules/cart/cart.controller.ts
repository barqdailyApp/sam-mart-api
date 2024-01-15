import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartRequest } from './dto/requests/add-to-cart-request';
import { plainToInstance } from 'class-transformer';
import { CartProduct } from 'src/infrastructure/entities/cart/cart-products';
import { ApiTags, ApiHeader, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { RolesGuard } from '../authentication/guards/roles.guard';
import { CartProductRespone } from './dto/respone/cart-product-repspone';
import { I18nResponse } from 'src/core/helpers/i18n.helper';

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

    return cart_products.map(
      (e) =>
        new CartProductRespone({
          total_price: e.price,
          quantity: e.quantity,
          product: e.product_category_price,
        }),
    );
  }

  @Post('/add')
  async createCart(@Body() req: AddToCartRequest) {
    return await this.cartService.addToCart(req);
  }
}
