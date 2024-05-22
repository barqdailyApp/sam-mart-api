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
import { Warehouse } from 'src/infrastructure/entities/warehouse/warehouse.entity';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { Roles } from '../authentication/guards/roles.decorator';

@ApiTags('Cart')
@ApiHeader({
  name: 'Accept-Language',
  required: false,
  description: 'Language header: en, ar',
})
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.CLIENT)
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
            id: e.cart.id,
            additional_services: e.cart.additions,
            original_price:e.cart.price,
            price:
              Number(e.cart.product_category_price.price) +
              (e.cart.additions?.length > 0
                ? Number(
                    e.cart.product_category_price.product_additional_services.filter(
                      (j) => {
                        return e.cart.additions?.includes(j.id);
                      },
                    )[0].price,
                  )
                : 0),
            quantity: e.cart.quantity,
            product: e.cart.product_category_price,
            warehouse_quantity: e.warehouses_product,
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
      id: result.cart.id,
      additional_services: result.cart.additions,
      original_price: result.cart.price,
      price:
        Number(result.cart.product_category_price.price) +
        (result.cart.additions?.length > 0
          ? Number(
              result.cart.product_category_price.product_additional_services.filter(
                (j) => {
                  return result.cart.additions?.includes(j.id);
                },
              )[0].price,
            )
          : 0),
      quantity: result.cart.quantity,
      product: result.cart.product_category_price,
      warehouse_quantity: result.warehouse_quantity,
    });

    return new ActionResponse(response);
  }

  @Delete('/delete/:cart_product_id')
  async deleteCartProduct(@Param('cart_product_id') cart_product_id: string) {
    const get_cart_product = await this.cartService.getSingleCartProduct(
      cart_product_id,
    );
    await this.cartService.deleteCartProduct(cart_product_id);

    return new ActionResponse(
      this._i18nResponse.entity(
        new CartProductRespone({
          id: get_cart_product.cart.id,
          additional_services: get_cart_product.cart.additions,
          original_price:get_cart_product.cart.price,
          price:   
          Number(get_cart_product.cart.product_category_price.price) +
          (get_cart_product.cart.additions?.length > 0
            ? Number(
              get_cart_product.cart.product_category_price.product_additional_services.filter(
                  (j) => {
                    return get_cart_product.cart.additions?.includes(j.id);
                  },
                )[0].price,
              )
            : 0),
          quantity: get_cart_product.cart.quantity,
          product: get_cart_product.cart.product_category_price,
          Warehouse_quantity: get_cart_product.warehouse_quantity,
        }),
      ),
    );
  }

  @Put('/update/:cart-product')
  async updateCartProduct(@Body() req: UpdateCartProductRequest) {
    const cart_product = await this.cartService.updatecartProduct(req);
    const result = this._i18nResponse.entity(
      await this.cartService.getSingleCartProduct(cart_product.id),
    );

    const response = new CartProductRespone({
      id: result.cart.id,
      additional_services: result.cart.additions,
      original_price:result.cart.price,
      price:
        Number(result.cart.product_category_price.price) +
        (result.cart.additions?.length > 0
          ? Number(
              result.cart.product_category_price.product_additional_services.filter(
                (j) => {
                  return result.cart.additions?.includes(j.id);
                },
              )[0].price,
            )
          : 0),
      quantity: result.cart.quantity,
      product: result.cart.product_category_price,
      warehouse_quantity: result.warehouse_quantity,
    });
    return new ActionResponse(response);
  }

  @Put('/update/:cart-product/service')
  async addRemoveService(@Body() req: AddRemoveCartProductServiceRequest) {
    const cart_product = await this.cartService.addRemoveService(req);
    const result = this._i18nResponse.entity(
      await this.cartService.getSingleCartProduct(cart_product.id),
    );

    const response = new CartProductRespone({
      id: result.cart.id,
      additional_services: result.cart.additions,
      original_price:result.cart.price,
      price:
        Number(result.cart.product_category_price.price) +
        (result.cart.additions?.length > 0
          ? Number(
              result.cart.product_category_price.product_additional_services.filter(
                (j) => {
                  return result.cart.additions?.includes(j.id);
                },
              )[0].price,
            )
          : 0),
      quantity: result.cart.quantity,
      product: result.cart.product_category_price,
      warehouse_quantity: result.warehouse_quantity,
    });

    return new ActionResponse(response);
  }
}
