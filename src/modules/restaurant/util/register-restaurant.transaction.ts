// import { BadRequestException, Inject, Injectable } from '@nestjs/common';

// import * as uuidv4 from 'uuid';
// import { RegisterRestaurantRequest } from '../dto/requests/register-restaurant.request';
// import { REQUEST } from '@nestjs/core';
// import { Order } from 'sequelize';
// import { BaseTransaction } from 'src/core/base/database/base.transaction';
// import { OrderGateway } from 'src/integration/gateways/order.gateway';
// import { NotificationService } from 'src/modules/notification/notification.service';
// import { PaymentMethodService } from 'src/modules/payment_method/payment_method.service';
// import { PromoCodeService } from 'src/modules/promo-code/promo-code.service';
// import { TransactionService } from 'src/modules/transaction/transaction.service';
// import { DataSource, EntityManager } from 'typeorm';
// import { Request } from 'express';
// import { Restaurant } from 'src/infrastructure/entities/restaurant/restaurant.entity';

// @Injectable()
// export class RegisterRestaurantTransaction extends BaseTransaction<
//   RegisterRestaurantRequest,
//   Restaurant
// > {
//   constructor(
//     dataSource: DataSource,
//     @Inject(REQUEST) readonly request: Request,
//     private readonly orderGateway: OrderGateway,
//     private readonly notificationService: NotificationService,
//     private readonly paymentService: PaymentMethodService,
//     private readonly promoCodeService: PromoCodeService,
//     private readonly transactionService: TransactionService,
//   ) {
//     super(dataSource);
//   }

//   // the important thing here is to use the manager that we've created in the base class
//   protected async execute(
//     req: RegisterRestaurantRequest,
//     context: EntityManager,
//   ): Promise<Restaurant> {
//     try {
   
// }
