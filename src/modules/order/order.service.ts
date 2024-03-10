import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BaseUserService } from 'src/core/base/service/user-service.base';
import { Order } from 'src/infrastructure/entities/order/order.entity';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
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
import { ReturnOrderRequest } from './dto/request/return-order.request';
import { ShipmentProduct } from 'src/infrastructure/entities/order/shipment-product.entity';
import { ReturnOrderStatus } from 'src/infrastructure/data/enums/return-order-status.enum';
import { ReturnOrder } from 'src/infrastructure/entities/order/return-order/return-order.entity';
import { ReturnOrderProduct } from 'src/infrastructure/entities/order/return-order/return-order-product.entity';
import { ReturnProductReason } from 'src/infrastructure/entities/order/return-order/return-product-reason.entity';
import { UpdateReturnOrderStatusRequest } from './dto/request/update-return-order-statu.request';
import { OrderGateway } from 'src/integration/gateways/order.gateway';

@Injectable()
export class OrderService extends BaseUserService<Order> {
  constructor(
    @InjectRepository(Order) private orderRepository: Repository<Order>,

    @InjectRepository(Shipment)
    private shipmentRepository: Repository<Shipment>,
    @InjectRepository(ShipmentProduct)
    private shipmentProductRepository: Repository<ShipmentProduct>,

    @InjectRepository(ReturnOrder)
    private ReturnOrderRepository: Repository<ReturnOrder>,
    @InjectRepository(ReturnOrderProduct)
    private returnOrderProductRepository: Repository<ReturnOrderProduct>,
    @InjectRepository(ReturnProductReason)
    private returnProductReasonRepository: Repository<ReturnProductReason>,

    @InjectRepository(Driver)
    private driverRepository: Repository<Driver>,

    @Inject(REQUEST) request: Request,
    private readonly makeOrdrTransacton: MakeOrderTransaction,
    private readonly orderGateway: OrderGateway,
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
    const {
      limit,
      page,
      order_date,
      is_paid,
      payment_method,
      warehouse_id,
      driver_id,
      client_id,
      delivery_type,
      status,
      order_search,
    } = orderClientQuery;
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

    if (status) {
      query = query.andWhere('shipments.status = :status', { status });
    }
    if (order_date) {
      //*using database functions to truncate the time part of the order.created_at timestamp to compare only the date components
      query = query.where('DATE(order.created_at) = :order_date', {
        order_date,
      });
    }

    if (is_paid) {
      query = query.andWhere('order.is_paid = :is_paid', {
        is_paid,
      });
    }

    if (payment_method) {
      query = query.andWhere('order.payment_method = :payment_method', {
        payment_method,
      });
    }

    if (delivery_type) {
      query = query.andWhere('order.delivery_type = :delivery_type', {
        delivery_type,
      });
    }

    if (driver_id) {
      query = query.andWhere('shipment_user_driver.id = :driver_id', {
        driver_id,
      });
    }
    if (client_id) {
      query = query.andWhere('user.id = :client_id', {
        client_id,
      });
    }

    if (warehouse_id) {
      query = query.andWhere('warehouse_order.id = :warehouse_id', {
        warehouse_id,
      });
    }

    if (order_search) {
      query = query.andWhere(
        '(user.name LIKE :order_search OR user.phone LIKE :order_search OR order.number LIKE :order_search)',
        { order_search: `%${order_search}%` },
      );
    }
    const [orders, total] = await query.getManyAndCount();
    return { orders, total };
  }
  async getTotalDashboardOrders() {
    const ordersTotal = await this.shipmentRepository.count({});
    const ordersNew = await this.shipmentRepository.count({
      where: {
        status: ShipmentStatusEnum.PENDING,
      },
    });

    const ordersDriversAccepted = await this.shipmentRepository.count({
      where: {
        status: ShipmentStatusEnum.CONFIRMED,
      },
    });

    const ordersProcessing = await this.shipmentRepository.count({
      where: {
        status: ShipmentStatusEnum.PROCESSING,
      },
    });

    const ordersPicked = await this.shipmentRepository.count({
      where: {
        status: ShipmentStatusEnum.PICKED_UP,
      },
    });

    const ordersDelivered = await this.shipmentRepository.count({
      where: {
        status: ShipmentStatusEnum.DELIVERED,
      },
    });

    const ordersCanceled = await this.shipmentRepository.count({
      where: {
        status: ShipmentStatusEnum.CANCELED,
      },
    });
    return {
      ordersTotal,
      ordersNew,
      ordersDriversAccepted,
      ordersProcessing,
      ordersPicked,
      ordersDelivered,
      ordersCanceled,
    };
  }

  async getSingleOrderDashboard(order_id: string) {
    const order = await this.orderRepository.findOne({
      where: { id: order_id },
    });

    if (!order) {
      throw new BadRequestException('Order not found');
    }
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
        'product_sub_category.category_subCategory',
        'category_subCategory',
      )

      .leftJoinAndSelect('category_subCategory.subcategory', 'subcategory')

      .leftJoinAndSelect(
        'category_subCategory.section_category',
        'section_category',
      )
      .leftJoinAndSelect('section_category.category', 'category')

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
        'product_sub_category.category_subCategory',
        'category_subCategory',
      )

      .leftJoinAndSelect('category_subCategory.subcategory', 'subcategory')

      .leftJoinAndSelect(
        'category_subCategory.section_category',
        'section_category',
      )
      .leftJoinAndSelect('section_category.category', 'category')

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
    const driver = await this.driverRepository.findOne({
      where: {
        user_id: user.id,
      },
    });
    // Start building the query with necessary joins to fetch related entities.
    let query = this.shipmentRepository
      .createQueryBuilder('shipments')
      .leftJoinAndSelect('shipments.order', 'order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.address', 'address')

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
      .where('shipments.warehouse_id = :warehouse_id', { warehouse_id: driver.warehouse_id })
      .skip(skip) // Apply pagination offset.
      .take(limit); // Limit the number of results returned.


    
    if (order_date) {
      //*using database functions to truncate the time part of the order.created_at timestamp to compare only the date components
      query = query.andWhere('order.delivery_day = :delivery_day', {
        delivery_day:order_date,
      });
    }
    // Apply filters based on the shipment status.
    if (status) {
      if (status === ShipmentStatusEnum.ACTIVE) {
        // For ACTIVE status, filter shipments that are either picked up, CONFIRMED, or PROCESSING.
        query = query.andWhere('shipments.status IN (:...statuses)', {
          statuses: [
            ShipmentStatusEnum.PICKED_UP,
            ShipmentStatusEnum.CONFIRMED,
            ShipmentStatusEnum.PROCESSING,
          ],
        });
        query = query.andWhere('driver.user_id = :user_id', {
          user_id: user.id,
        });
      } else if (
        status === ShipmentStatusEnum.PENDING &&
        driver.is_receive_orders
      ) {
        // For PENDING status, filter shipments that are specifically PENDING.

        query = query.andWhere('shipments.status = :status', {
          status: ShipmentStatusEnum.PENDING,
        });
        query = query.andWhere('order.delivery_type = :delivery_type', {
          delivery_type: DeliveryType.FAST,
        });
        // check driver is_receive_orders true
      } else {
        // For any other status, filter by the specific status and ensure the shipment belongs to the current user.
        query = query.andWhere('shipments.status = :status', { status });
        query = query.andWhere('driver.user_id = :user_id', {
          user_id: user.id,
        });
      }
    }

    // Execute the query to get the shipments and the total count.
    const [orders, total] = await query.getManyAndCount();

    // Return the shipments and the total count.
    return { orders, total };
  }
  async getTotalDriverShipments() {
    const user = this.currentUser;
    const driver = await this.driverRepository.findOne({
      where: {
        user_id: user.id,
      },
    });
    const ordersNew = await this.shipmentRepository.count({
      where: {
        status: ShipmentStatusEnum.PENDING,
        warehouse_id: driver.warehouse_id,
        order: {
          delivery_day: new Date().toISOString().split('T')[0],
          delivery_type: DeliveryType.FAST,
        },
      },
      relations: { order: true },
    });
    const ordersActive = await this.shipmentRepository.count({
      where: {
        status: In([
          ShipmentStatusEnum.CONFIRMED,
          ShipmentStatusEnum.PROCESSING,
          ShipmentStatusEnum.PICKED_UP,
        ]),
        driver_id: driver.id,
        warehouse_id: driver.warehouse_id,
      },
    });

    const ordersDelivered = await this.shipmentRepository.count({
      where: {
        status: ShipmentStatusEnum.DELIVERED,
        driver_id: driver.id,
        warehouse_id: driver.warehouse_id,
      },
    });

    return {
      ordersNew,
      ordersActive,
      ordersDelivered,
    };
  }
  async getDashboardShipments(driverShipmentsQuery: DriverShipmentsQuery) {
    const { limit, page, status, driver_id, order_date,order_search } = driverShipmentsQuery;
    const skip = (page - 1) * limit;
    let query = this.shipmentRepository
      .createQueryBuilder('shipments')
      .leftJoinAndSelect('shipments.order', 'order')
      .leftJoinAndSelect('order.user', 'user')

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
    // Filter orders that are being delivered today.
 
    if (order_date) {
      //*using database functions to truncate the time part of the order.created_at timestamp to compare only the date components
      query = query.andWhere('order.delivery_day = :delivery_day', {
        delivery_day:order_date,
      });
    }
    if (order_search) {
      query = query.andWhere(
        '(user.name LIKE :order_search OR user.phone LIKE :order_search)',
        { order_search: `%${order_search}%` },
      );
    }
    if (status) {
      if (status == ShipmentStatusEnum.ACTIVE) {
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

    if (driver_id) {
      query = query.andWhere('shipments.driver_id = :driver_id', { driver_id });
    }

    const [orders, total] = await query.getManyAndCount();
    return { orders, total };
  }

  async getSingleShipment(shipment_id: string) {
    let query = this.shipmentRepository
      .createQueryBuilder('shipments')
      .leftJoinAndSelect('shipments.order', 'order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.address', 'address')
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
  isArabic(text: string): boolean {
    return /[\u0600-\u06FF]/.test(text);
  }

  async broadcastOrderDrivers(order_id: string) {
    const order = await this.orderRepository.findOne({
      where: { id: order_id },
      relations: ['user', 'address']
    });
    if (!order) throw new NotFoundException('order not found');

    const shipment = await this.shipmentRepository.findOne({
      where: { order_id },
      relations: ['warehouse'],
    });
    if (!shipment) throw new NotFoundException('shipment not found');

    if (shipment.status !== ShipmentStatusEnum.PENDING) {
      throw new BadRequestException(
        'this order is already broadcasted to drivers',
      );
    }

    await this.orderGateway.notifyOrderStatusChange({
      action: shipment.status,
      to_rooms: [shipment.warehouse_id],
      body: {
        order,
        shipment,
        driver: null,
        client: order.user,
        warehouse: shipment.warehouse,
      },
    });
  }
}
