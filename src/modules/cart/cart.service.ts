import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/core/base/service/service.base';
import { CartProduct } from 'src/infrastructure/entities/cart/cart-products';
import { Cart } from 'src/infrastructure/entities/cart/cart.entity';
import { Repository } from 'typeorm/repository/Repository';
import { AddToCartRequest } from './dto/requests/add-to-cart-request';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { Product } from 'src/infrastructure/entities/product/product.entity';
import { ProductCategoryPrice } from 'src/infrastructure/entities/product/product-category-price.entity';

@Injectable()
export class CartService extends BaseService<CartProduct> {
  constructor(
    @InjectRepository(CartProduct)
    private cartProductRepository: Repository<CartProduct>,
    @InjectRepository(Cart) private cartRepository: Repository<Cart>,
    @InjectRepository(Product) private productRepository: Repository<Product>,
    @InjectRepository(ProductCategoryPrice)
    private productCategoryPrice: Repository<ProductCategoryPrice>,

    @Inject(REQUEST) readonly request: Request,
  ) {
    super(cartProductRepository);
  }

  async getCart() {
    return await this.cartRepository.findOne({
      where: { user_id: this.request.user.id },
    });
  }

  async getCartProducts(cart_id: string) {
    return await this.cartProductRepository.find({
      where: { cart_id: cart_id },
      relations: {
        product_category_price: {
          product_measurement: { measurement_unit: true },

          product_sub_category: {
            product: { product_images: true },
            category_subCategory: { section_category: true },
          },
        },
      },
    });
  }

  async addToCart(req: AddToCartRequest) {
    const cart = await this.getCart();


    const product_price = await this.productCategoryPrice.findOne({
      where: { id: req.product_category_price_id },
      relations: {
        product_offer: true,
      },
    });
    console.log('product_price', product_price);
    
    if (product_price.product_offer !=null) {
      product_price.min_order_quantity =
        product_price.product_offer.min_offer_quantity;
      product_price.max_order_quantity =
        product_price.product_offer.max_offer_quantity;
      product_price.price = product_price.product_offer.price;
    }
    if (
      req.quantity < product_price.min_order_quantity ||
      req.quantity > product_price.max_order_quantity
    ) {
      throw new BadRequestException(
        'Quantity should be between ' +
          product_price.min_order_quantity +
          ' and ' +
          product_price.max_order_quantity,
      );
    }
    const cart_product = await this.cartProductRepository.findOne({
      where: {
        cart_id: cart.id,
        product_category_price_id: req.product_category_price_id,
      },
    });
    if (cart_product) {
      cart_product.quantity += req.quantity;
      return this.cartProductRepository.save(cart_product);
    }
    return this.cartProductRepository.save(
      new CartProduct({
        cart_id: cart.id,

        quantity: req.quantity,
        product_category_price_id: req.product_category_price_id,
        price: Number(product_price.price) * req.quantity,
      }),
    );
  }
}
