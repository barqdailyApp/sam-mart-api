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
import { In } from 'typeorm';
import { calculateSum } from 'src/core/helpers/cast.helper';

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
    const additions = req.additions || [];
    console.log(additions);
    const product_price = await this.productCategoryPrice.findOne({
      where: {
        id: req.product_category_price_id,
        product_additional_services: {
          id: additions.length != 0 ? In(additions) : null,
        },
      },
      relations: {
        product_measurement: true,
        product_offer: true,
        product_additional_services: true,
        product_sub_category: {
          category_subCategory: { section_category: true },
        },
      },
    });
    console.log(product_price);

    if (product_price.product_offer != null) {
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

    if (additions.length > 0) {
      const additional_cost = calculateSum(
        product_price.product_additional_services.map((e) => {
          return Number (e.price);
        }),
        
      );
      product_price.price = Number(product_price.price) + Number(additional_cost);

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
        additions:additions,
        cart_id: cart.id,
        section_id:
          product_price.product_sub_category.category_subCategory
            .section_category.section_id,
        quantity: req.quantity,
        product_id: product_price.product_sub_category.product_id,
        product_category_price_id: req.product_category_price_id,
        price: product_price.price ,
        conversion_factor: product_price.product_measurement.conversion_factor,
        main_measurement_id: product_price.product_measurement.base_unit_id,
      }),
    );
  }
}
