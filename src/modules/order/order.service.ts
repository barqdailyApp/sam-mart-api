import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BaseUserService } from 'src/core/base/service/user-service.base';
import { Order } from 'src/infrastructure/entities/order/order.entity';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MakeOrderRequest } from './dto/request/make-order-request';
import { MakeOrderTransaction } from './util/make-order.transaction';
import { OrderClientQuery } from './filter/order-client.query';
import { SingleOrderQuery } from './filter/single-order.query';
import { Shipment } from 'src/infrastructure/entities/order/shipment.entity';
import { DriverShipmentsQuery } from './filter/driver-shipment.query';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { ShipmentStatusEnum } from 'src/infrastructure/data/enums/shipment_status.enum';
import { DeliveryType } from 'src/infrastructure/data/enums/delivery-type.enum';
import { AddShipmentFeedBackRequest } from './dto/request/add-shipment-feedback.request';
import { Driver } from 'src/infrastructure/entities/driver/driver.entity';
import { ShipmentFeedback } from 'src/infrastructure/entities/order/shipment-feedback.entity';
@Injectable()
export class OrderService extends BaseUserService<Order> {
  constructor(
    @InjectRepository(Order) private orderRepository: Repository<Order>,

    @InjectRepository(Shipment)
    private shipmentRepository: Repository<Shipment>,

    @Inject(REQUEST) request: Request,
    private readonly makeOrdrTransacton: MakeOrderTransaction,
  ) {
    super(orderRepository, request);
  }

  async makeOrder(req: MakeOrderRequest) {
    return await this.makeOrdrTransacton.run(req);
  }

  async getAllClientOrders(orderClientQuery: OrderClientQuery) {
    const user = this.currentUser;

    const { limit, page } = orderClientQuery;
    const skip = (page - 1) * limit;

    let query = this.orderRepository
      .createQueryBuilder('order')

      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.section', 'section_order')
      .leftJoinAndSelect('order.warehouse', 'warehouse_order')
      .leftJoinAndSelect('order.address', 'address')
      .leftJoinAndSelect('order.shipments', 'shipments')

      .leftJoinAndSelect('shipments.driver', 'driver')
      .leftJoinAndSelect('driver.user', 'shipment_user_driver')

      .leftJoinAndSelect('shipments.warehouse', 'warehouse_shipment')
      .leftJoinAndSelect('shipments.shipment_products', 'shipment_products')

      .leftJoinAndSelect(
        'shipment_products.product_category_price',
        'product_category_price',
      )
      .leftJoinAndSelect(
        'product_category_price.product_sub_category',
        'product_sub_category',
      )

      .leftJoinAndSelect(
        'product_category_price.product_measurement',
        'product_measurement',
      )
      .leftJoinAndSelect(
        'product_measurement.measurement_unit',
        'measurement_unit',
      )

      .leftJoinAndSelect('product_sub_category.product', 'product')
      .leftJoinAndSelect('product.product_images', 'product_images')
      .skip(skip)
      .take(limit);

    query = query.where('order.user_id = :user_id', { user_id: user.id });

    const [orders, total] = await query.getManyAndCount();
    return { orders, total };
  }

  async getAllDashboardOrders(orderClientQuery: OrderClientQuery) {
    const { limit, page } = orderClientQuery;
    const skip = (page - 1) * limit;

    let query = this.orderRepository
      .createQueryBuilder('order')

      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.section', 'section_order')
      .leftJoinAndSelect('order.warehouse', 'warehouse_order')
      .leftJoinAndSelect('order.address', 'address')
      .leftJoinAndSelect('order.shipments', 'shipments')

      .leftJoinAndSelect('shipments.driver', 'driver')
      .leftJoinAndSelect('driver.user', 'shipment_user_driver')

      .leftJoinAndSelect('shipments.warehouse', 'warehouse_shipment')
      .leftJoinAndSelect('shipments.shipment_products', 'shipment_products')

      .leftJoinAndSelect(
        'shipment_products.product_category_price',
        'product_category_price',
      )
      .leftJoinAndSelect(
        'product_category_price.product_sub_category',
        'product_sub_category',
      )

      .leftJoinAndSelect(
        'product_category_price.product_measurement',
        'product_measurement',
      )
      .leftJoinAndSelect(
        'product_measurement.measurement_unit',
        'measurement_unit',
      )

      .leftJoinAndSelect('product_sub_category.product', 'product')
      .leftJoinAndSelect('product.product_images', 'product_images')
      .skip(skip)
      .take(limit);

    const [orders, total] = await query.getManyAndCount();
    return { orders, total };
  }

  async getSingleOrder(order_id: string) {
    let query = this.orderRepository
      .createQueryBuilder('order')

      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.section', 'section_order')
      .leftJoinAndSelect('order.warehouse', 'warehouse_order')
      .leftJoinAndSelect('order.address', 'address')
      .leftJoinAndSelect('order.shipments', 'shipments')

      .leftJoinAndSelect('shipments.driver', 'driver')
      .leftJoinAndSelect('driver.user', 'shipment_user_driver')

      .leftJoinAndSelect('shipments.warehouse', 'warehouse_shipment')
      .leftJoinAndSelect('shipments.shipment_products', 'shipment_products')

      .leftJoinAndSelect(
        'shipment_products.product_category_price',
        'product_category_price',
      )
      .leftJoinAndSelect(
        'product_category_price.product_sub_category',
        'product_sub_category',
      )

      .leftJoinAndSelect(
        'product_category_price.product_measurement',
        'product_measurement',
      )
      .leftJoinAndSelect(
        'product_measurement.measurement_unit',
        'measurement_unit',
      )

      .leftJoinAndSelect('product_sub_category.product', 'product')
      .leftJoinAndSelect('product.product_images', 'product_images');

    //  single order
    query = query.where('order.id = :id', { id: order_id });

    return query.getOne();
  }

  // Function to get shipments for a driver based on various filters.
  async getMyDriverShipments(driverShipmentsQuery: DriverShipmentsQuery) {
    // Retrieve the current user (assuming this is available via some context or service).
    const user = this.currentUser;

    // Destructure the query parameters for easier access.
    const { limit, page, status, order_date } = driverShipmentsQuery;
    const skip = (page - 1) * limit; // Calculate the offset for pagination.

    // Start building the query with necessary joins to fetch related entities.
    let query = this.shipmentRepository
      .createQueryBuilder('shipments')
      .leftJoinAndSelect('shipments.order', 'order')
      .leftJoinAndSelect('shipments.driver', 'driver')
      .leftJoinAndSelect('driver.user', 'shipment_user_driver')
      .leftJoinAndSelect('shipments.warehouse', 'warehouse_shipment')
      .leftJoinAndSelect('shipments.shipment_products', 'shipment_products')
      .leftJoinAndSelect(
        'shipment_products.product_category_price',
        'product_category_price',
      )
      .leftJoinAndSelect(
        'product_category_price.product_sub_category',
        'product_sub_category',
      )
      .leftJoinAndSelect(
        'product_category_price.product_measurement',
        'product_measurement',
      )
      .leftJoinAndSelect(
        'product_measurement.measurement_unit',
        'measurement_unit',
      )
      .leftJoinAndSelect('product_sub_category.product', 'product')
      .leftJoinAndSelect('product.product_images', 'product_images')
      .skip(skip) // Apply pagination offset.
      .take(limit); // Limit the number of results returned.

    // Filter orders by FAST delivery type.
    query = query.andWhere('order.delivery_type = :delivery_type', {
      delivery_type: DeliveryType.FAST,
    });
    // Filter orders that are being delivered today.
    if (order_date) {
      query = query.andWhere('order.delivery_day = :delivery_day', {
        delivery_day: order_date,
      });
    }

    // Apply filters based on the shipment status.
    if (status) {
      if (status === ShipmentStatusEnum.ACTIVE) {
        // For ACTIVE status, filter shipments that are either DELIVERED, CONFIRMED, or PROCESSING.
        query = query.andWhere('shipments.status IN (:...statuses)', {
          statuses: [
            ShipmentStatusEnum.DELIVERED,
            ShipmentStatusEnum.CONFIRMED,
            ShipmentStatusEnum.PROCESSING,
          ],
        });
      } else if (status === ShipmentStatusEnum.PENDING) {
        // For PENDING status, filter shipments that are specifically PENDING.
        query = query.andWhere('shipments.status = :status', {
          status: ShipmentStatusEnum.PENDING,
        });
        // check driver is_receive_orders true
        query = query.andWhere(
          'driver.is_receive_orders = :is_receive_orders',
          { is_receive_orders: true },
        );
      } else {
        // For any other status, filter by the specific status and ensure the shipment belongs to the current user.
        query = query
          .andWhere('driver.user_id = :user_id', { user_id: user.id })
          .andWhere('shipments.status = :status', { status })
          .andWhere('driver.warehouse_id = shipments.warehouse_id');
        // Filter shipments by matching driver's warehouse_id with the shipment's warehouse_id.
      }
    } else {
      // If no status is provided, filter shipments to those that belong to the current user.
      query = query.andWhere('driver.user_id = :user_id', { user_id: user.id });

      // Filter shipments by matching driver's warehouse_id with the shipment's warehouse_id.
      query = query.where('driver.warehouse_id = shipments.warehouse_id');
    }

    // Execute the query to get the shipments and the total count.
    const [orders, total] = await query.getManyAndCount();

    // Return the shipments and the total count.
    return { orders, total };
  }

  async getDashboardShipments(driverShipmentsQuery: DriverShipmentsQuery) {
    const { limit, page, status } = driverShipmentsQuery;
    const skip = (page - 1) * limit;
    let query = this.shipmentRepository
      .createQueryBuilder('shipments')
      .leftJoinAndSelect('shipments.order', 'order')

      .leftJoinAndSelect('shipments.driver', 'driver')
      .leftJoinAndSelect('driver.user', 'shipment_user_driver')

      .leftJoinAndSelect('shipments.warehouse', 'warehouse_shipment')
      .leftJoinAndSelect('shipments.shipment_products', 'shipment_products')

      .leftJoinAndSelect(
        'shipment_products.product_category_price',
        'product_category_price',
      )
      .leftJoinAndSelect(
        'product_category_price.product_sub_category',
        'product_sub_category',
      )

      .leftJoinAndSelect(
        'product_category_price.product_measurement',
        'product_measurement',
      )
      .leftJoinAndSelect(
        'product_measurement.measurement_unit',
        'measurement_unit',
      )

      .leftJoinAndSelect('product_sub_category.product', 'product')
      .leftJoinAndSelect('product.product_images', 'product_images')
      .skip(skip)
      .take(limit);

    if (status) {
      if (status == ShipmentStatusEnum.ACTIVE) {
        console.log('status', status);
        // i want all shipments have status DELIVERED or CONFIRMED or PROCESSING
        query = query.andWhere('shipments.status IN (:...statuses)', {
          statuses: [
            ShipmentStatusEnum.DELIVERED,
            ShipmentStatusEnum.CONFIRMED,
            ShipmentStatusEnum.PROCESSING,
          ],
        });
      } else {
        query = query.andWhere('shipments.status = :status', { status });
      }
    }
    const [orders, total] = await query.getManyAndCount();
    return { orders, total };
  }

  async getSingleShipment(shipment_id: string) {
    let query = this.shipmentRepository
      .createQueryBuilder('shipments')
      .leftJoinAndSelect('shipments.order', 'order')

      .leftJoinAndSelect('shipments.driver', 'driver')
      .leftJoinAndSelect('driver.user', 'shipment_user_driver')

      .leftJoinAndSelect('shipments.warehouse', 'warehouse_shipment')
      .leftJoinAndSelect('shipments.shipment_products', 'shipment_products')

      .leftJoinAndSelect(
        'shipment_products.product_category_price',
        'product_category_price',
      )
      .leftJoinAndSelect(
        'product_category_price.product_sub_category',
        'product_sub_category',
      )

      .leftJoinAndSelect(
        'product_category_price.product_measurement',
        'product_measurement',
      )
      .leftJoinAndSelect(
        'product_measurement.measurement_unit',
        'measurement_unit',
      )

      .leftJoinAndSelect('product_sub_category.product', 'product')
      .leftJoinAndSelect('product.product_images', 'product_images');

    //  single order
    query = query.where('shipments.id = :id', { id: shipment_id });

    return query.getOne();
  }

  async sendOrderToDrivers(id: string) {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) throw new NotFoundException('order not found');
    order.delivery_type = DeliveryType.FAST;
    return await this.orderRepository.save(order);
  }
}
