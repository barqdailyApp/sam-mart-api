import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseUserService } from 'src/core/base/service/user-service.base';
import { ReturnOrderProduct } from 'src/infrastructure/entities/order/return-order/return-order-product.entity';
import { ReturnOrder } from 'src/infrastructure/entities/order/return-order/return-order.entity';
import { ReturnProductReason } from 'src/infrastructure/entities/order/return-order/return-product-reason.entity';
import { In, Repository } from 'typeorm';
import { BaseService } from 'src/core/base/service/service.base';
import { User } from 'src/infrastructure/entities/user/user.entity';
import { ReturnOrderRequest } from './dto/request/return-order.request';
import { OrderGateway } from 'src/integration/gateways/order.gateway';
import { Order } from 'src/infrastructure/entities/order/order.entity';
import { Shipment } from 'src/infrastructure/entities/order/shipment.entity';
import { ShipmentStatusEnum } from 'src/infrastructure/data/enums/shipment_status.enum';
import { ShipmentProduct } from 'src/infrastructure/entities/order/shipment-product.entity';
import { ReturnOrderStatus } from 'src/infrastructure/data/enums/return-order-status.enum';
import { Driver } from 'src/infrastructure/entities/driver/driver.entity';
import { UpdateReturnOrderStatusRequest } from './dto/request/update-return-order-statu.request';
import { PaginatedRequest } from 'src/core/base/requests/paginated.request';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { NotificationService } from '../notification/notification.service';
import { NotificationTypes } from 'src/infrastructure/data/enums/notification-types.enum';
import { NotificationEntity } from 'src/infrastructure/entities/notification/notification.entity';
import { Reason } from 'src/infrastructure/entities/reason/reason.entity';
import { ReasonType } from 'src/infrastructure/data/enums/reason-type.enum';
import { WarehouseOperationTransaction } from '../warehouse/util/warehouse-opreation.transaction';
import { operationType } from 'src/infrastructure/data/enums/operation-type.enum';
import { ProductMeasurement } from 'src/infrastructure/entities/product/product-measurement.entity';
import { TransactionService } from '../transaction/transaction.service';
import { MakeTransactionRequest } from '../transaction/dto/requests/make-transaction-request';
import { TransactionTypes } from 'src/infrastructure/data/enums/transaction-types';

@Injectable()
export class ReturnOrderService extends BaseService<ReturnOrder> {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Shipment)
    private shipmentRepository: Repository<Shipment>,
    @InjectRepository(ShipmentProduct)
    private shipmentProductRepository: Repository<ShipmentProduct>,
    @InjectRepository(Driver)
    private driverRepository: Repository<Driver>,

    @InjectRepository(ReturnOrder)
    private returnOrderRepository: Repository<ReturnOrder>,
    @InjectRepository(ReturnOrderProduct)
    private returnOrderProductRepository: Repository<ReturnOrderProduct>,
    @InjectRepository(ReturnProductReason)
    private returnProductReasonRepository: Repository<ReturnProductReason>,
    @InjectRepository(Reason)
    private reasonRepository: Repository<Reason>,
    @InjectRepository(ProductMeasurement)
    private productMeasurementRepository: Repository<ProductMeasurement>,


    @Inject(REQUEST) readonly request: Request,
    @Inject(TransactionService)
    private readonly transactionService: TransactionService,
    private readonly orderGateway: OrderGateway,
    private readonly notificationService: NotificationService,
    private readonly warehouseOperationTransaction: WarehouseOperationTransaction,

  ) {
    super(returnOrderRepository);
  }

  async returnOrder(order_id: string, req: ReturnOrderRequest) {
    const { returned_shipment_products } = req;
    const returned_shipment_products_id = returned_shipment_products.map(
      (p) => p.shipment_product_id,
    );

    // check if the order exists
    const order = await this.orderRepository.findOne({
      where: { id: order_id },
    });
    if (!order) throw new NotFoundException('message.order_not_found');

    // check if the order belongs to the current user
    if (order.user_id !== this.currentUser.id) {
      throw new BadRequestException('message.not_allowed_to_return');
    }

    // check if the order is delivered
    const shipment = await this.shipmentRepository.findOne({
      where: { order_id },
      relations: ['warehouse'],
    });
    if (!shipment) throw new NotFoundException('shipment not found');

    if (
      shipment.status !== ShipmentStatusEnum.DELIVERED &&
      shipment.status !== ShipmentStatusEnum.COMPLETED &&
      shipment.status !== ShipmentStatusEnum.CANCELED
    ) {
      throw new BadRequestException(
        'message.not_allowed_to_return_not_delivered',
      );
    }

    // check if the return products IDs are valid and belongs to the order
    const shipmentProducts = await this.shipmentProductRepository.find({
      where: {
        shipment_id: shipment.id,
        id: In(returned_shipment_products_id),
      },
    });

    if (shipmentProducts.length !== returned_shipment_products.length) {
      throw new BadRequestException('message.invalid_products_ids');
    }

    const canNotReturnProducts = shipmentProducts.find(
      (p) => p.can_return === false,
    );
    if (canNotReturnProducts) {
      throw new BadRequestException(
        "message.not_allowed_to_return_already_returned" +
        JSON.stringify(canNotReturnProducts),
      );
    }

    // check if the return products quantities are valid based on the shipment products
    const invalidQuantityForProducts = returned_shipment_products.filter(
      (p) => {
        const product = shipmentProducts.find(
          (sp) => sp.id === p.shipment_product_id,
        );
        return product.quantity < p.quantity;
      },
    );

    if (invalidQuantityForProducts.length > 0) {
      throw new BadRequestException(
        `invalid quantity for products ${JSON.stringify(
          invalidQuantityForProducts,
        )}`,
      );
    }

    // check if the return products reasons IDs are valid
    const returnedProductsReasons = await this.reasonRepository.find({
      where: {
        id: In(returned_shipment_products.map((p) => p.return_product_reason_id)),
        type: ReasonType.RETURN_ORDER,
      },
    });

    if (
      returnedProductsReasons.length !==
      new Set(returned_shipment_products.map((p) => p.return_product_reason_id)).size
    ) {
      throw new BadRequestException("message.invalid_return_reasons_ids");
    }

    const returnOrder = await this.returnOrderRepository.create({
      status: ReturnOrderStatus.PENDING,
      order,
      returnOrderProducts: req.returned_shipment_products,
      customer_note: req.customer_note,
    });

    await this.shipmentProductRepository.update(
      {
        id: In(returned_shipment_products_id),
      },
      {
        can_return: false,
      },
    );

    const savedReturnOrder = await this.returnOrderRepository.save(returnOrder);
    await this.orderGateway.notifyReturnOrder({
      to_rooms: ['admin'],
      body: {
        client: this.currentUser,
        driver: null,
        order,
        returnOrder: savedReturnOrder,
        warehouse: shipment.warehouse,
      },
    });
    await this.notificationService.create(
      new NotificationEntity({
        user_id: this.currentUser.id,
        url: savedReturnOrder.id,
        type: NotificationTypes.ORDERS,
        title_ar: 'منتجع',
        title_en: 'return order',
        text_ar: 'هل تريد ارجاع هذا الطلب ؟',
        text_en: 'Do you want to return this order?',
      }),
    );

    return savedReturnOrder;
  }

  // this method is used by the admin to update the return order status
  async updateReturnOrderStatus(
    return_order_id: string,
    req: UpdateReturnOrderStatusRequest,
  ) {

    let amount_of_returned_money = 0;
    const returnOrder = await this.returnOrderRepository.findOne({
      where: { id: return_order_id },
      relations: ['order', 'order.user', 'order.shipments', 'order.address'],
    });

    if (!returnOrder) throw new NotFoundException('return order not found');

    const { return_order_products, admin_note, driver_id, status } = req;
    const returned_products_id = return_order_products.map(
      (p) => p.return_order_product_id,
    );

    // check if the return order products IDs are valid
    const returnOrderProducts = await this.returnOrderProductRepository.find({
      where: {
        id: In(returned_products_id),
        return_order_id,
      },
      relations: { shipmentProduct: true },
    });

    if (returnOrderProducts.length !== return_order_products.length) {
      throw new BadRequestException("message.invalid_return_order_products_ids");
    }

    let driver: Driver = null;
    if (driver_id) {
      driver = await this.driverRepository.findOne({
        where: { id: driver_id },
      });
      if (!driver) throw new BadRequestException("message.driver_not_found");
      returnOrder.driver_id = driver_id;
    }

    // mapped the return order products with the updated status
    const mappedReturnProductsNewStatus = returnOrderProducts.map((p) => {
      const product = return_order_products.find(
        (rp) => rp.return_order_product_id === p.id,
      );
      return {
        ...p,
        status: product.status,
      };
    });

    await this.returnOrderProductRepository.save(
      mappedReturnProductsNewStatus,
    );

    returnOrder.status = status;
    returnOrder.admin_note = admin_note;
    if (returnOrder.status === ReturnOrderStatus.ACCEPTED) {
      returnOrder.request_accepted_at = new Date();
    }

    const savedReturnOrder = await this.returnOrderRepository.save(returnOrder);

    const mappedImportedProducts = [];
    for (const return_product of mappedReturnProductsNewStatus) {
      // because shipmentProduct.product_measurement_id is the unit name not the main unit id
      const product_measurement = await this.productMeasurementRepository.findOne({
        where: {
          product_id: return_product.shipmentProduct.product_id,
          is_main_unit: true,
        },
      });

      if (return_product.status === ReturnOrderStatus.ACCEPTED) {
        mappedImportedProducts.push({
          product_id: return_product.shipmentProduct.product_id,
          product_measurement_id: product_measurement.id,
          quantity: return_product.quantity * return_product.shipmentProduct.conversion_factor,
        });

        amount_of_returned_money += return_product.quantity * return_product.shipmentProduct.price;
      }
    }

    // if the return order is accepted, we need to update the warehouse products
    await this.warehouseOperationTransaction.run({
      products: mappedImportedProducts,
      warehouse_id: returnOrder.order.shipments[0].warehouse_id,
      type: operationType.IMPORT,
    });

    await this.transactionService.makeTransaction(
      new MakeTransactionRequest({
        amount: amount_of_returned_money,
        type: TransactionTypes.ORDER_RETURN,
        order_id: returnOrder.order.id,
        user_id: returnOrder.order.user_id,
      }),
    );

    const shipment = await this.shipmentRepository.findOne({
      where: { order_id: returnOrder.order_id },
      relations: ['warehouse'],
    });

    await this.orderGateway.notifyReturnOrder({
      to_rooms: [returnOrder.order.user.id, driver?.id],
      body: {
        client: returnOrder.order.user,
        driver: driver,
        order: returnOrder.order,
        returnOrder: savedReturnOrder,
        warehouse: shipment.warehouse,
      },
    });
    await this.notificationService.create(
      new NotificationEntity({
        user_id: returnOrder.order.user_id,
        url: returnOrder.id,
        type: NotificationTypes.ORDERS,
        title_ar: 'منتجع',
        title_en: 'return order',
        text_ar: 'تم تحديث طلب المرتجع',
        text_en: 'Return request has been updated',
      }),
    );
    return savedReturnOrder;
  }

  async getReturnOrders(query: PaginatedRequest) {
    query.filters ??= [];

    if (
      query.filters !== null
      && typeof query.filters === 'string'
    ) {
      query.filters = [query.filters];
    }

    if (this.currentUser.roles.includes(Role.CLIENT)) {
      if (query.filters[0]) {
        query.filters[0] = `${query.filters[0]},order.user_id=${this.currentUser.id}`;
      } else {
        query.filters.push(`order.user_id=${this.currentUser.id}`);
      }
    } else if (this.currentUser.roles.includes(Role.DRIVER)) {
      const driver = await this.driverRepository.findOne({
        where: { user_id: this.currentUser?.id },
      });
      
      if (query.filters[0]) {
        query.filters[0] = `${query.filters[0]},driver_id=${driver?.id}`;
      } else {
        query.filters.push(`driver_id=${driver?.id}`);
      }
    }

    return await this.findAll(query);
  }

  get currentUser(): User {
    return this.request.user;
  }
}
