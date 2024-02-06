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
import { or, where } from 'sequelize';
import { Cart } from 'src/infrastructure/entities/cart/cart.entity';
import { CartProduct } from 'src/infrastructure/entities/cart/cart-products';
import { plainToInstance } from 'class-transformer';
import { Shipment } from 'src/infrastructure/entities/order/shipment.entity';
import { ShipmentProduct } from 'src/infrastructure/entities/order/shipment-product.entity';
import { WarehouseOperations } from 'src/infrastructure/entities/warehouse/warehouse-opreations.entity';
import { operationType } from 'src/infrastructure/data/enums/operation-type.enum';
import { WarehouseProducts } from 'src/infrastructure/entities/warehouse/warehouse-products.entity';
import { DeliveryType } from 'src/infrastructure/data/enums/delivery-type.enum';
import { Section } from 'src/infrastructure/entities/section/section.entity';
import { Slot } from 'src/infrastructure/entities/order/slot.entity';
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
      const section = await context.findOne(Section, {
        where: { id: req.section_id },
      });
      if (!section.delivery_type.includes(req.delivery_type)) {
        throw new BadRequestException(
          'Section does not support this type of delivery',
        );
      }

      const user = this.request.user;
      const address = await context.findOne(Address, {
        where: [{ id: req.address_id, user_id: user.id }],
      });
      const cart = await context.findOne(Cart, { where: { user_id: user.id } });

      const cart_products = await context.find(CartProduct, {
        where: { cart_id: cart.id, section_id: req.section_id },
      });
      if (cart_products.length == 0) {
        throw new BadRequestException('Cart is empty');
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

      const order = await context.save(Order, {
        ...plainToInstance(Order, req),
        user_id: user.id,
        warehouse_id: nearst_warehouse.id,
        delivery_fee: section.delivery_price,
      });
      const count = await context
        .createQueryBuilder(Order, 'order')
        .where('DATE(order.created_at) = CURDATE()')
        .getCount();
      order.number = generateOrderNumber(count);

      if (order.delivery_type == DeliveryType.FAST) {
        const currentDate = new Date();

        // Add 40 minutes
        currentDate.setMinutes(currentDate.getMinutes() + 40);
        order.delivery_day = currentDate.toISOString().slice(0, 10);
        order.estimated_delivery_time = currentDate;
      } else {
        order.delivery_day = req.slot_day.day;
        order.slot_id = req.slot_day.slot_id;
        const slot = await context.findOne(Slot, {
          where: { id: req.slot_day.slot_id },
        });
        order.estimated_delivery_time = new Date(
          req.slot_day.day + 'T' + slot.start_time,
        );
      }

      const shipment = await context.save(Shipment, {
        order_id: order.id,
        warehouse_id: nearst_warehouse.id,
      });

      const shipment_products = cart_products.map(
        (e) => new ShipmentProduct({ shipment_id: shipment.id, ...e }),
      );
      await context.save(shipment_products);
      order.total_price = shipment_products.reduce(
        (a, b) => a + b.price * b.quantity,
        0,
      );
      if (order.total_price < section.min_order_price) {
        throw new BadRequestException(
          'total price is less than min order price',
        );
      }

      await context.save(Order, order);
      await context.delete(CartProduct, cart_products);

      //warehouse opreation

       for (let index = 0; index < shipment_products.length; index++) {
        const warehouse_product = await context.findOne(WarehouseProducts, {
          where: {
            warehouse_id: nearst_warehouse.id,
            product_id: shipment_products[index].product_id,
          },
        });
        if (!warehouse_product) {
          throw new BadRequestException('warehouse doesnt have product');
        }
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
export const generateOrderNumber = (count: number) => {
  // number of digits matches ##-**-@@-&&&&, where ## is 100 - the year last 2 digits, ** is 100 - the month, @@ is 100 - the day, &&&& is the number of the order in that day
  const date = new Date();
  const year = date.getFullYear().toString().substr(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  // order number is the count of orders created today + 1 with 4 digits and leading zeros
  const orderNumber = (count + 1).toString().padStart(4, '0');
  return `${100 - parseInt(year)}${100 - parseInt(month)}${
    100 - parseInt(day)
  }${orderNumber}`;
};
