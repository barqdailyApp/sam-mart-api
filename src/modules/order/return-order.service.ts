import { Inject, Injectable } from "@nestjs/common";
import { Request } from 'express';
import { REQUEST } from "@nestjs/core";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseUserService } from "src/core/base/service/user-service.base";
import { ReturnOrderProduct } from "src/infrastructure/entities/order/return-order/return-order-product.entity";
import { ReturnOrder } from "src/infrastructure/entities/order/return-order/return-order.entity";
import { ReturnProductReason } from "src/infrastructure/entities/order/return-order/return-product-reason.entity";
import { Repository } from "typeorm";
import { BaseService } from "src/core/base/service/service.base";

@Injectable()
export class ReturnOrderService extends BaseService<ReturnOrder> {
    constructor(
        @InjectRepository(ReturnOrder)
        private returnOrderRepository: Repository<ReturnOrder>,
        @InjectRepository(ReturnOrderProduct)
        private returnOrderProductRepository: Repository<ReturnOrderProduct>,
        @InjectRepository(ReturnProductReason)
        private returnProductReasonRepository: Repository<ReturnProductReason>,

        @Inject(REQUEST) request: Request,
    ) {
        super(returnOrderRepository);
    }
}