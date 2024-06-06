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
import { UpdateCartProductRequest } from './dto/requests/update-cart-request';
import { AddRemoveCartProductServiceRequest } from './dto/requests/add-remove-service-request';
import { Address } from 'src/infrastructure/entities/user/address.entity';
import { Warehouse } from 'src/infrastructure/entities/warehouse/warehouse.entity';
import { WarehouseProducts } from 'src/infrastructure/entities/warehouse/warehouse-products.entity';

@Injectable()
export class CartService extends BaseService<CartProduct> {
  constructor(
    @InjectRepository(CartProduct)
    private cartProductRepository: Repository<CartProduct>,
    @InjectRepository(Address) private addressRepository: Repository<Address>,
    @InjectRepository(Cart) private cartRepository: Repository<Cart>,
    @InjectRepository(WarehouseProducts)
    private WarehouseProductsRepository: Repository<WarehouseProducts>,
    @InjectRepository(Warehouse)
    private warehouseRepository: Repository<Warehouse>,
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
    const cart_products = await this.cartProductRepository.find({
      where: { cart_id: cart_id },
      relations: {
        product_category_price: {
          product_additional_services: { additional_service: true },

          product_measurement: { measurement_unit: true },

          product_offer: true,
          product_sub_category: {
            product: { product_images: true, warehouses_products: true },
            category_subCategory: { section_category: true },
          },
        },
      },
      withDeleted: true,
    });
    const cart_products_warehouse = await Promise.all(
      cart_products.map(async (e) => {
        const is_offer =
          e.product_category_price.product_offer &&
          e.product_category_price.product_offer.offer_quantity > 0 &&
          e.product_category_price.product_offer.is_active &&
          e.product_category_price.product_offer.start_date < new Date() &&
          new Date() < e.product_category_price.product_offer.end_date &&
          e.product_category_price.product_offer.offer_quantity >= e.quantity;

        if (is_offer) {
          e.product_category_price.min_order_quantity =
            e.product_category_price.product_offer.min_offer_quantity;
          e.product_category_price.max_order_quantity =
            e.product_category_price.product_offer.max_offer_quantity;
          e.product_category_price.price =
            e.product_category_price.product_offer.price;
        }
        if (e.quantity < e.product_category_price.min_order_quantity) {
          e.quantity = e.product_category_price.min_order_quantity;
        }
        e.is_offer = is_offer;
        if (is_offer==false) {
          delete e.product_category_price.product_offer;
        }

        const warehouses_product =
          await this.WarehouseProductsRepository.findOne({
            where: { warehouse_id: e.warehouse_id, product_id: e.product_id },
          });

        warehouses_product.quantity =
          warehouses_product.quantity / e.conversion_factor;
        const min_order_quantity = is_offer
          ? e.product_category_price.product_offer.min_offer_quantity
          : e.product_category_price.min_order_quantity;
        if (warehouses_product.quantity < e.quantity)
          e.quantity = Math.floor(
            warehouses_product.quantity / min_order_quantity,
          );
        return { cart: e, warehouses_product: warehouses_product.quantity };
      }),
    );

    await this.cartProductRepository.save(cart_products);
    return cart_products_warehouse;
  }
  async getSingleCartProduct(id: string) {
    const cart_product = await this.cartProductRepository.findOne({
      where: { id },
      relations: {
        product_category_price: {
          product_additional_services: { additional_service: true },

          product_measurement: { measurement_unit: true },

          product_offer: true,
          product_sub_category: {
            product: { product_images: true, warehouses_products: true },
            category_subCategory: { section_category: true },
          },
        },
      },
      withDeleted: true,
    });
    const is_offer =
      cart_product.product_category_price.product_offer &&
      cart_product.product_category_price.product_offer.offer_quantity > 0 &&
      cart_product.product_category_price.product_offer.is_active &&
      cart_product.product_category_price.product_offer.start_date <
        new Date() &&
      new Date() < cart_product.product_category_price.product_offer.end_date &&
      cart_product.product_category_price.product_offer.offer_quantity >=
        cart_product.quantity;

    if (is_offer) {
      cart_product.product_category_price.min_order_quantity =
        cart_product.product_category_price.product_offer.min_offer_quantity;
      cart_product.product_category_price.max_order_quantity =
        cart_product.product_category_price.product_offer.max_offer_quantity;
      cart_product.product_category_price.price =
        cart_product.product_category_price.product_offer.price;
    }

    cart_product.product_category_price.product_sub_category.product.warehouses_products.filter(
      (w) => w.warehouse_id == cart_product.warehouse_id,
    );
    cart_product.product_category_price.product_sub_category.product.warehouses_products[0].quantity =
      cart_product.product_category_price.product_sub_category.product
        .warehouses_products[0].quantity / cart_product.conversion_factor;
    if (!cart_product.is_offer) {
      delete cart_product.product_category_price.product_offer;
    }

    return {
      cart: cart_product,
      warehouse_quantity:
        cart_product.product_category_price.product_sub_category.product.warehouses_products.filter(
          (w) => w.warehouse_id == cart_product.warehouse_id,
        )[0].quantity,
    };
  }

  async addToCart(req: AddToCartRequest) {
    const cart = await this.getCart();
    const additions = req.additions || [];

    const user = this.request.user;
    const address = await this.addressRepository.findOne({
      where: [{ is_favorite: true, user_id: user.id }],
    });
    if (!address) {
      throw new BadRequestException('user does not have a default address');
    }
    const product_price = await this.productCategoryPrice.findOne({
      where: {
        id: req.product_category_price_id,
        product_additional_services: {
          id: additions.length != 0 ? In(additions) : null,
        },
      },
      relations: {
        product_measurement: { measurement_unit: true },
        product_offer: true,
        product_additional_services: true,
        product_sub_category: {
          category_subCategory: { section_category: true },
        },
      },
    });
    let original_price = product_price.price;
    const nearst_warehouse = await this.warehouseRepository
      .createQueryBuilder('warehouse')
      .where('is_active = :is_active', { is_active: true })
      .orderBy(
        `ST_Distance_Sphere(
             ST_SRID(point(${address.latitude}, ${address.longitude}), 4326),
             warehouse.location
         )`,
      )
      .getOne();

    const warehouse_product = await this.WarehouseProductsRepository.findOne({
      where: {
        warehouse_id: nearst_warehouse.id,
        product_id: product_price.product_measurement.product_id,
      },
    });
    if (!warehouse_product) {
      throw new BadRequestException('message.warehouse_product_not_enough');
    }

    const cart_product = await this.cartProductRepository.findOne({
      where: {
        cart_id: cart.id,
        product_category_price_id: req.product_category_price_id,
      },
    });
    if (cart_product) {
      this.cartProductRepository.remove(cart_product);
    }
    const is_offer =
      product_price.product_offer &&
      product_price.product_offer.offer_quantity > 0 &&
      product_price.product_offer.is_active &&
      product_price.product_offer.start_date < new Date() &&
      new Date() < product_price.product_offer.end_date &&
      product_price.product_offer.offer_quantity >=
        product_price.min_order_quantity;
    if (is_offer) {
      product_price.min_order_quantity =
        product_price.product_offer.min_offer_quantity;
      product_price.max_order_quantity =
        product_price.product_offer.max_offer_quantity;
      product_price.price = product_price.product_offer.price;
    }
    if (additions.length > 0) {
      const additional_cost = calculateSum(
        product_price.product_additional_services.map((e) => {
          return Number(e.price);
        }),
      );
      original_price = Number(original_price) + Number(additional_cost);
      product_price.price =
        Number(product_price.price) + Number(additional_cost);
    }
    warehouse_product.quantity =
      warehouse_product.quantity -
      product_price.min_order_quantity *
        product_price.product_measurement.conversion_factor;

    if (warehouse_product.quantity < 0) {
      throw new BadRequestException('message.warehouse_product_not_enough');
    }

    return await this.cartProductRepository.save(
      new CartProduct({
        additions: additions,
        is_offer: is_offer,
        warehouse_id: nearst_warehouse.id,
        cart_id: cart.id,
        section_id:
          product_price.product_sub_category.category_subCategory
            .section_category.section_id,
        quantity: product_price.min_order_quantity,
        product_id: product_price.product_sub_category.product_id,
        product_category_price_id: req.product_category_price_id,
        price: original_price,
        conversion_factor: product_price.product_measurement.conversion_factor,
        main_measurement_id:
          product_price.product_measurement.measurement_unit_id,
      }),
    );
  }

  async deleteCartProduct(cart_product_id: string) {
    const cart_product = await this.cartProductRepository.findOne({
      where: { id: cart_product_id },
    });
    await this.cartProductRepository.delete({
      id: cart_product_id,
    });
    return cart_product;
  }

  async updatecartProduct(req: UpdateCartProductRequest) {
    const cart_product = await this.cartProductRepository.findOne({
      where: { id: req.cart_product_id },
    });
    const warehouse_product = await this.WarehouseProductsRepository.findOne({
      where: {
        warehouse_id: cart_product.warehouse_id,
        product_id: cart_product.product_id,
      },
    });
    const product_category_price = await this.productCategoryPrice.findOne({
      where: { id: cart_product.product_category_price_id },
      relations: {
        product_measurement: true,
        product_offer: true,
        product_additional_services: true,
        product_sub_category: {
          category_subCategory: { section_category: true },
        },
      },
    });
    const is_offer =
      product_category_price.product_offer &&
      product_category_price.product_offer.offer_quantity > 0 &&
      product_category_price.product_offer.is_active &&
      product_category_price.product_offer.start_date < new Date() &&
      new Date() < product_category_price.product_offer.end_date &&
      (req.add == true
        ? product_category_price.product_offer.offer_quantity >=
          product_category_price.product_offer.min_offer_quantity +
            cart_product.quantity
        : true);

    if (is_offer) {
      product_category_price.min_order_quantity =
        product_category_price.product_offer.min_offer_quantity;
      product_category_price.max_order_quantity =
        product_category_price.product_offer.max_offer_quantity;
      product_category_price.price = product_category_price.product_offer.price;
    }

    if (req.add == true) {
      if (
        cart_product.quantity + product_category_price.min_order_quantity >
        product_category_price.max_order_quantity
      )
        cart_product.quantity = cart_product.quantity;
      else cart_product.quantity += product_category_price.min_order_quantity;
    } else {
      if (
        cart_product.quantity - product_category_price.min_order_quantity >=
        product_category_price.min_order_quantity
      )
        cart_product.quantity -= product_category_price.min_order_quantity;
    }

    if (!warehouse_product) {
      throw new BadRequestException('message.warehouse_product_not_enough');
    }
    warehouse_product.quantity =
      warehouse_product.quantity -
      cart_product.quantity * cart_product.conversion_factor;
    if (warehouse_product.quantity < 0) {
      throw new BadRequestException('message.warehouse_product_not_enough');
    }

    return {
      ...(await this.cartProductRepository.save(cart_product)),
      min_order_quantity: product_category_price.min_order_quantity,
      max_order_quantity: product_category_price.max_order_quantity,
    };
  }

  async addRemoveService(req: AddRemoveCartProductServiceRequest) {
    const cart_product = await this.cartProductRepository.findOne({
      where: { id: req.cart_product_id },
    });
    const product_category_price = await this.productCategoryPrice.findOne({
      where: { id: cart_product.product_category_price_id },
      relations: {
        product_measurement: true,
        product_offer: true,
        product_additional_services: true,
        product_sub_category: {
          category_subCategory: { section_category: true },
        },
      },
    });

    if (req.additions && req.additions.length > 0) {
      cart_product.price = Number(cart_product.price);
      req.additions.forEach((e) => {
        const service = product_category_price.product_additional_services.find(
          (s) => s.id == e,
        );

        if (cart_product.additions.includes(e)) {
          const index = cart_product.additions.indexOf(e);
          if (index > -1) {
            cart_product.additions.splice(index, 1);

            cart_product.price -= Number(service.price);
          }
        } else {
          if (cart_product.additions.length > 0) {
            const old_service =
              product_category_price.product_additional_services.find(
                (s) => s.id == cart_product.additions[0],
              );
            cart_product.price -= Number(old_service.price);
            cart_product.additions.splice(0, 1);
          }

          cart_product.additions.push(e);
          cart_product.price += Number(service.price);
        }
      });
    }
    return await this.cartProductRepository.save(cart_product);
  }
}
