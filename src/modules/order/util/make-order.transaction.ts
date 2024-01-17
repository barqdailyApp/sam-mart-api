import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseTransaction } from 'src/core/base/database/base.transaction';
import { jwtSignOptions } from 'src/core/setups/jwt.setup';
import { Otp } from 'src/infrastructure/entities/auth/otp.entity';
import { UserService } from 'src/modules/user/user.service';
import { DataSource, EntityManager, UpdateResult } from 'typeorm';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';
import { UserInfoResponse } from 'src/modules/user/dto/responses/profile.response';
import { MakeOrderRequest } from '../dto/make-order-request';
import { Order } from 'src/infrastructure/entities/order/order.entity';
import { Warehouse } from 'src/infrastructure/entities/warehouse/warehouse.entity';
import { Address } from 'src/infrastructure/entities/user/address.entity';
import { where } from 'sequelize';
import { Cart } from 'src/infrastructure/entities/cart/cart.entity';
import { CartProduct } from 'src/infrastructure/entities/cart/cart-products';
import { plainToInstance } from 'class-transformer';
import { Shipment } from 'src/infrastructure/entities/order/shipment.entity';
import { ShipmentProduct } from 'src/infrastructure/entities/order/shipment-product.entity';
import { WarehouseOperations } from 'src/infrastructure/entities/warehouse/warehouse-opreations.entity';
import { operationType } from 'src/infrastructure/data/enums/operation-type.enum';
import { WarehouseProducts } from 'src/infrastructure/entities/warehouse/warehouse-products.entity';
@Injectable()
export class MakeOrderTransaction extends BaseTransaction<
  MakeOrderRequest,
  Order
> {
  constructor(
    dataSource: DataSource,
    @Inject(REQUEST) readonly request: Request,
  ) {
    super(dataSource);
  }

  // the important thing here is to use the manager that we've created in the base class
  protected async execute(
    req: MakeOrderRequest,
    context: EntityManager,
  ): Promise<Order> {
    try {
      const user = this.request.user;
      const address = await context.findOne(Address, {
        where: [{ id: req.address_id, user_id: user.id }],
      });
      const cart = await context.findOne(Cart, { where: { user_id: user.id } });
      const cart_products = await context.find(CartProduct, {
        where: { cart_id: cart.id, section_id: req.section_id },
      });
      if(cart_products.length == 0){
        throw new BadRequestException("Cart is empty");
      }
      const nearst_warehouse = await context
        .createQueryBuilder(Warehouse, 'warehouse')
        .orderBy(
          `ST_Distance_Sphere(
                 ST_SRID(point(${address.latitude}, ${address.longitude}), 4326),
                 warehouse.location
             )`,
        )
        .getOne();
      console.log(nearst_warehouse);
      const order = await context.save(Order, {
        ...plainToInstance(Order, req),
        user_id: user.id,
        warehouse_id: nearst_warehouse.id,
      });
      const shipment = await context.save(Shipment, {
        order_id: order.id,
        warehouse_id: nearst_warehouse.id,
      });
    
      const shipment_products = cart_products.map(
        (e) => new ShipmentProduct({ shipment_id: shipment.id, ...e }),
      );
      await context.save(shipment_products);
      await context.delete(CartProduct, cart_products);

      //warehouse opreation

      for (let index = 0; index < shipment_products.length; index++) {
        const warehouse_product = await context.findOne(WarehouseProducts, {
          where: {
            warehouse_id: nearst_warehouse.id,
            product_id: shipment_products[index].product_id,
          },
        });
        warehouse_product.quantity =
          warehouse_product.quantity -
          shipment_products[index].quantity *
            shipment_products[index].conversion_factor;
        if (warehouse_product.quantity < 0) {
          throw new BadRequestException(
            'warehouse doesnt have enough products',
          );
        }
        await context.save(warehouse_product);
        await context.save(
          WarehouseOperations,
          new WarehouseOperations({
            warehouse_id: nearst_warehouse.id,
            product_id: shipment_products[index].product_id,
            type: operationType.SELL,
            user_id: user.id,
            product_measurement_id:
              shipment_products[index].main_measurement_id,
            quantity:
              -shipment_products[index].quantity *
              shipment_products[index].conversion_factor,
          }),
        );
      }
      return order;
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error);
    }
  }
}
