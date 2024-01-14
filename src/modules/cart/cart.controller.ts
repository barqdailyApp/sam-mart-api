import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartRequest } from './dto/add-to-cart-request';
import { plainToInstance } from 'class-transformer';
import { CartProduct } from 'src/infrastructure/entities/cart/cart-products';
import { ApiTags, ApiHeader, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { RolesGuard } from '../authentication/guards/roles.guard';

@ApiTags("Cart")
@ApiHeader({ name: 'Accept-Language', required: false, description: 'Language header: en, ar' })

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
@Controller('cart')
export class CartController {


    constructor(private readonly cartService: CartService) { }

@Get()
async getCartProducts() {

    const cart= await this.cartService.getCart();
    return await this.cartService.getCartProducts(cart.id);
}

@Post("/add")
async createCart(@Body() req:AddToCartRequest) {


    return  await this.cartService.addToCart(req);
}
}
