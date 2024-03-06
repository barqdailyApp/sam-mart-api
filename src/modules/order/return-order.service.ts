import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Request } from 'express';
import { REQUEST } from "@nestjs/core";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseUserService } from "src/core/base/service/user-service.base";
import { ReturnOrderProduct } from "src/infrastructure/entities/order/return-order/return-order-product.entity";
import { ReturnOrder } from "src/infrastructure/entities/order/return-order/return-order.entity";
import { ReturnProductReason } from "src/infrastructure/entities/order/return-order/return-product-reason.entity";
import { In, Repository } from "typeorm";
import { BaseService } from "src/core/base/service/service.base";
import { User } from "src/infrastructure/entities/user/user.entity";
import { ReturnOrderRequest } from "./dto/request/return-order.request";
import { OrderGateway } from "src/integration/gateways/order.gateway";
import { Order } from "src/infrastructure/entities/order/order.entity";
import { Shipment } from "src/infrastructure/entities/order/shipment.entity";
import { ShipmentStatusEnum } from "src/infrastructure/data/enums/shipment_status.enum";
import { ShipmentProduct } from "src/infrastructure/entities/order/shipment-product.entity";
import { ReturnOrderStatus } from "src/infrastructure/data/enums/return-order-status.enum";
import { Driver } from "src/infrastructure/entities/driver/driver.entity";
import { UpdateReturnOrderStatusRequest } from "./dto/request/update-return-order-statu.request";
import { PaginatedRequest } from "src/core/base/requests/paginated.request";
import { Role } from "src/infrastructure/data/enums/role.enum";

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

        @Inject(REQUEST) readonly request: Request,
        private readonly orderGateway: OrderGateway,
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
        if (!order) throw new NotFoundException('order not found');

        // check if the order belongs to the current user
        if (order.user_id !== this.currentUser.id) {
            throw new BadRequestException('you are not allowed to return this order');
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
                'you can not return this order that is not delivered yet',
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
            throw new BadRequestException('invalid products IDs');
        }

        const canNotReturnProducts = shipmentProducts.find(
            (p) => p.can_return === false,
        );
        if (canNotReturnProducts) {
            throw new BadRequestException(
                `you can't return this product alread returned ${JSON.stringify(
                    canNotReturnProducts,
                )}`,
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
        const returnedProductsReasons =
            await this.returnProductReasonRepository.find({
                where: {
                    id: In(returned_shipment_products.map((p) => p.reason_id)),
                },
            });

        if (
            returnedProductsReasons.length !==
            new Set(returned_shipment_products.map((p) => p.reason_id)).size
        ) {
            throw new BadRequestException(`invalid return reasons IDs`);
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
                return_order: savedReturnOrder,
                warehouse: shipment.warehouse,
            },
        });

        return savedReturnOrder;
    }
    
    // this method is used by the admin to update the return order status
    async updateReturnOrderStatus(
        return_order_id: string,
        req: UpdateReturnOrderStatusRequest,
    ) {
        const returnOrder = await this.returnOrderRepository.findOne({
            where: { id: return_order_id },
            relations: ['order', 'order.user'],
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
        });

        if (returnOrderProducts.length !== return_order_products.length) {
            throw new BadRequestException('invalid return order products IDs');
        }

        let driver: Driver = null;
        if (driver_id) {
            driver = await this.driverRepository.findOne({
                where: { id: driver_id },
            });
            if (!driver) throw new BadRequestException('driver not found');
        }

        // mapped the return order products with the updated status
        const mappedUpdatedReturnOrderProducts = returnOrderProducts.map((p) => {
            const product = return_order_products.find(
                (rp) => rp.return_order_product_id === p.id,
            );
            return {
                ...p,
                status: product.status,
            };
        });

        await this.returnOrderProductRepository.save(
            mappedUpdatedReturnOrderProducts,
        );
        const savedReturnOrder = await this.returnOrderRepository.save(returnOrder);

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
                return_order: savedReturnOrder,
                warehouse: shipment.warehouse,
            },
        });

        return savedReturnOrder;
    }

    async getReturnOrders(query: PaginatedRequest) {
        query.filters ??= [];
        if (this.currentUser.roles.includes(Role.CLIENT)) {
            query.filters.push(`order.user_id=${this.currentUser.id}`);
        } else if (this.currentUser.roles.includes(Role.DRIVER)) {
            query.filters.push(`driver_id=${this.currentUser.id}`);
        }

        return await this.findAll(query);
    }

    async addReturnProductReason(reason: string) {
        return await this.returnProductReasonRepository.save({ reason });
    }

    async getReturnProductReasons() {
        return await this.returnProductReasonRepository.find();
    }

    async updateReturnProductReason(reason_id: string, reason: string) {
        const reasonExists = await this.returnProductReasonRepository.findOne({
            where: { id: reason_id },
        });
        if (!reasonExists) throw new BadRequestException('reason not found');

        return await this.returnProductReasonRepository.update(
            { id: reason_id },
            { reason },
        );
    }

    async deleteReturnProductReason(reason_id: string) {
        const reasonExists = await this.returnProductReasonRepository.findOne({
            where: { id: reason_id },
        });
        if (!reasonExists) throw new BadRequestException('reason not found');

        return await this.returnProductReasonRepository.delete({ id: reason_id });
    }

    get currentUser(): User {
        return this.request.user
    }
}