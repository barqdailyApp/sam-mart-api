import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderBookingTransaction } from './util/order-booking.transaction';
import { OrderBookingRequest } from './dto/requests/order-booking-request';
import { BaseService } from 'src/core/base/service/service.base';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { Order } from 'src/infrastructure/entities/order/order.entity';
import { Customer } from 'src/infrastructure/entities/customer/customer.entity';
import { Service } from 'src/infrastructure/entities/package/service.entity';
import { SubscriptionPackageService } from 'src/infrastructure/entities/subscription/subscription-service.entity';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';
import { OrderStatus } from 'src/infrastructure/data/enums/order-status.enum';
import { Biker } from 'src/infrastructure/entities/biker/biker.entity';
import { OrderDetails } from 'src/infrastructure/entities/order/order-details';
import { OrderServices } from 'src/infrastructure/entities/order/order-services';
import { getDistanceFromLatLonInKm } from 'src/core/helpers/geom.helper';
import { OrderFinishRequest } from './dto/requests/order-finish.request';
import { FileService } from '../file/file.service';
import { plainToInstance } from 'class-transformer';
import { UploadFileRequest } from '../file/dto/requests/upload-file.request';
import { OrderImage } from 'src/infrastructure/entities/order/order-image.entity';
import { OrderFilterRequest } from './dto/requests/order-filter.request';
import { Variable } from 'src/infrastructure/entities/variable/variable.entity';
import { variableTypes } from 'src/infrastructure/data/enums/variable.enum';
import { getDate } from 'src/core/helpers/cast.helper';
import { I18nResponse } from 'src/core/helpers/i18n.helper';
import { OrderDetailsResponse } from './dto/response/order-details.response';
import { Gateways } from 'src/core/base/gateways';
import { OrderGateway } from 'src/integration/gateways/order.gateway';
import { NotificationService } from '../notification/services/notification.service';
import { NotificationEntity } from 'src/infrastructure/entities/notification/notification.entity';
import { NotificationTypes } from 'src/infrastructure/data/enums/notification-types.enum';
import { CreateCancelOrderRequest } from './dto/requests/create-order-cancel.request';
import { CancelReasons } from 'src/infrastructure/entities/order-cancel/cancel-reasons.entity';
import { ReportAbuse } from 'src/infrastructure/entities/order-cancel/report_abuse.entity';
import { OrderResponse } from './dto/response/order-response';
import { OrderRescheduleTransaction } from './util/order-reschedule.tranaction';
import { Subscription } from 'src/infrastructure/entities/subscription/subscription.entity';
import { SubscriptionStatus } from 'src/infrastructure/data/enums/subscription.enum';
import { AppConstants } from 'src/infrastructure/entities/app-constants/app-constants.entity';
import { Points } from 'src/infrastructure/entities/points/point.entity';
import { User } from 'src/infrastructure/entities/user/user.entity';
import { CronOrderService } from './cron-order.service';

@Injectable()
export class OrderService extends BaseService<Order> {
  constructor(
    @Inject(OrderBookingTransaction)
    private readonly orderBookingTransaction: OrderBookingTransaction,
    private readonly orderRescheduleTransaction: OrderRescheduleTransaction,
    private readonly cronOrder: CronOrderService,
    @InjectRepository(SubscriptionPackageService)
    private readonly service_repo: Repository<SubscriptionPackageService>,
    @InjectRepository(Subscription)
    private readonly subscription_repo: Repository<Subscription>,
    @InjectRepository(Customer)
    private readonly customer_repo: Repository<Customer>,
    @Inject(REQUEST) private readonly _request: Request,
    @InjectRepository(OrderServices)
    private readonly order_service_repo: Repository<OrderServices>,
    @InjectRepository(Variable)
    private readonly variable_repo: Repository<Variable>,
    @InjectRepository(Biker) private readonly biker_repo: Repository<Biker>,
    @InjectRepository(Order) private readonly order_repo: Repository<Order>,
    @InjectRepository(OrderDetails)
    private readonly order_details_repo: Repository<OrderDetails>,
    @InjectRepository(OrderImage)
    private readonly order_image_repo: Repository<OrderImage>,
    @Inject(FileService) private _fileService: FileService,
    @Inject(I18nResponse) private readonly _i18nResponse: I18nResponse,
    @Inject(OrderGateway) private orderGateway: OrderGateway,
    private readonly _notificationService: NotificationService,
    @InjectRepository(CancelReasons)
    private readonly cancel_reasons_repo: Repository<CancelReasons>,
    @InjectRepository(ReportAbuse)
    private readonly report_abuse_repo: Repository<ReportAbuse>,
    @InjectRepository(AppConstants)
    private app_constants: Repository<AppConstants>,
    @InjectRepository(Points)
    public pointRepository: Repository<Points>,
    @InjectRepository(User)
    public userRepository: Repository<User>,
    @Inject(NotificationService)
    public readonly notificationService: NotificationService,
  ) {
    super(order_repo);
  }

  async getAppConstants() {
    const app_constants = await this.app_constants.find();
    return app_constants[0];
  }

  async orderBooking(query: OrderBookingRequest) {
    const booking_limit = getDate(
      (await this.variable_repo.findOneBy({ type: variableTypes.BOOKING_DATE }))
        .variable,
    );
    const order_date = new Date(query.order_date);
    if (booking_limit < order_date)
      throw new BadRequestException('message.booking_limit_reached');
    const order_save = await this.orderBookingTransaction.run(query);
    console.log(order_save);
    const biker = await this.getBiker();
    const order = await this.order_repo.findOne({
      where: {
        id: order_save.id,
      },

      relations: {
        services: true,
        subscription: true,
        slot: true,
        vehicle: {
          color: true,
          images: true,
          brand_model: true,
          brand: true,
        },
        order_invoice: {
          subscription: {
            service: true,
          },
        },
        address: true,
        customer: { user: true },
        biker: { user: true },
      },
    });
    if (order.biker_id) {
      const today = new Date().toISOString().split('T')[0];
      const all_orders_biker = await this.order_repo.find({
        where: {
          order_date: today,
        },
        relations: {
          services: true,
          subscription: true,
          slot: true,
          vehicle: {
            color: true,
            images: true,
            brand_model: true,
            brand: true,
          },
          order_invoice: {
            subscription: {
              service: true,
            },
          },
          address: true,
          customer: { user: true },
          biker: { user: true },
        },
        order: {
          slot: {
            start_time: 'ASC',
          },
        },
      });
      const all_orders_biker_res = all_orders_biker.map(
        (order) => new OrderResponse(order),
      );
      all_orders_biker.forEach((e) => {
        this.orderGateway.server.emit(
          `${Gateways.Order.UserId}${e.biker.user_id}`,
          {
            action: 'ORDER_BIKER_ON_THE_WAY',
            data: {
              order_id: e.id,
              message: this._i18nResponse.entity(
                all_orders_biker_res.filter((j) => {
                  if (j.biker.id == e.biker.id) return j;
                }),
              ),
            },
          },
        );
      });
    }

    return order;
  }

  async allOrders(orderFilterRequest: OrderFilterRequest) {
    const { status, page, limit, order_date, is_complete, is_ongoing } =
      orderFilterRequest;

    const skip = (page - 1) * limit;

    const customer = await this.findCustomer();
    const biker = await this.getBiker();
    let status_is_complete = [];
    let status_is_ongoing = [];

    if (is_complete == true) {
      status_is_complete = [OrderStatus.COMPLETED, OrderStatus.CANCELLED];
    } else if (is_complete == false) {
      status_is_complete = [
        OrderStatus.CREATED,
        OrderStatus.STARTED,
        OrderStatus.BIKER_ON_THE_WAY,
        OrderStatus.BIKER_ARRIVED,
      ];
    } else {
      status_is_complete = [];
    }

    if (is_ongoing == true) {
      status_is_ongoing = [
        OrderStatus.COMPLETED,
        OrderStatus.CANCELLED,
        OrderStatus.CREATED,
      ];
    } else if (is_ongoing == false) {
      status_is_ongoing = [
        OrderStatus.STARTED,
        OrderStatus.BIKER_ON_THE_WAY,
        OrderStatus.BIKER_ARRIVED,
      ];
    } else {
      status_is_ongoing = [];
    }

    if (customer) {
      return await this.order_repo.find({
        skip,
        take: limit,
        where: {
          customer_id: customer.id,
          status:
            status_is_ongoing.length != 0
              ? In(status_is_ongoing)
              : status_is_complete.length != 0
              ? In(status_is_complete)
              : status,

          order_date,
        },withDeleted: true, 
        relations: {
          services: true,
          subscription: true,
          slot: true,
          vehicle: {
            color: true,
            images: true,
            brand_model: true,
            brand: true,
          },
          order_invoice: {
            subscription: {
              service: true,
            },
          },
          address: true,
          customer: { user: true },
          biker: { user: true },
        },
        order: {
          slot: {
            start_time: 'ASC',
          },
        },
      });
    } else if (biker) {
      return await this.order_repo.find({
        skip,
        take: limit,
        withDeleted:true,
        where: {
          biker_id: biker.id,
          status:
            status_is_ongoing.length != 0
              ? In(status_is_ongoing)
              : status_is_complete.length != 0
              ? In(status_is_complete)
              : status,
          order_date,
        },
        relations: {
          services: true,
          subscription: true,
          slot: true,
          vehicle: {
            color: true,
            images: true,
            brand_model: true,
            brand: true,
          },
          order_invoice: {
            subscription: {
              service: true,
            },
          },
          address: true,
          customer: { user: true },
          biker: { user: true },
        },
        order: {
          slot: {
            start_time: 'ASC',
          },
        },
      });
    } else {
      throw new NotFoundException();
    }
  }

  async singleOrder(id: string) {
    return await this.order_repo.findOne({
      where: {
        id: id,
      },
      withDeleted: true, 
      relations: {
        services: true,
        subscription: true,
        slot: true,
        vehicle: {
          color: true,
          images: true,
          brand_model: true,
          brand: true,
        },
        order_invoice: {
          subscription: {
            service: true,
          },
        },
        address: true,
        customer: { user: true },
        biker: { user: true },
      },
    });
  }

  async findCustomer() {
    return await this.customer_repo.findOneBy({
      user_id: this._request.user.id,
    });
  }
  async getBiker() {
    return await this.biker_repo.findOneBy({
      user_id: this._request.user.id,
    });
  }

  async bikerOnWay(id: string) {
    const biker = await this.getBiker();
    biker.is_active = false;
    await biker.save();

    const order = await this.order_repo.findOne({
      where: { id, biker_id: biker.id },
    });

    if (order.status != OrderStatus.CREATED)
      throw new BadRequestException('message.order_should_be_created_first');
    order.status = OrderStatus.BIKER_ON_THE_WAY;
    await this.order_repo.save(order);

    const order_details = new OrderDetails({
      order_id: order.id,
      estimated_biker_arrival_time: new Date(
        new Date().getTime() + (await this.getAppConstants()).biker_arrival_time * 60 * 1000,
      ),
    });

    await this.order_details_repo.save(order_details);
    const order_details_current = await this.singleOrderDetails(id);
    const order_Dto = new OrderDetailsResponse(order_details_current);
    const data: OrderDetailsResponse = this._i18nResponse.entity(order_Dto);
    const customer_user = order_details_current.order.customer.user_id;

    this.orderGateway.server.emit(`${Gateways.Order.UserId}${customer_user}`, {
      action: 'ORDER_BIKER_ON_THE_WAY',
      data: {
        order_id: data.order.id,
        message: data,
      },
    });
    if(order_details_current.order.customer.user.notification_is_active){
      await this.notificationService.create(
        new NotificationEntity({
          user_id: customer_user,
          url: customer_user,
          type: NotificationTypes.ORDERS,
          title_ar: 'الغسلة',
          title_en: 'The wash',
          text_ar: 'البايكر في طريقه اليك !',
          text_en: 'Biker on his way !',
        }),
      );
    }
  

    return data;
  }

  async bikerArrived(id: string) {
    const biker = await this.getBiker();

    const order = await this.order_repo.findOne({
      where: { id, biker_id: biker.id },
      relations: ['address'],
    });
    if (order.status != OrderStatus.BIKER_ON_THE_WAY)
      throw new BadRequestException();
    const distance = getDistanceFromLatLonInKm(
      biker.latitude,
      biker.longitude,
      order.address.latitude,
      order.address.longitude,
    );
    //TODO: return this comment After test
    //if (distance > 3) throw new BadRequestException('validation.not_near');
    order.status = OrderStatus.BIKER_ARRIVED;
    await this.order_repo.save(order);
    const order_details_current = await this.singleOrderDetails(id);
    const order_Dto = new OrderDetailsResponse(order_details_current);
    const data: OrderDetailsResponse = this._i18nResponse.entity(order_Dto);

    const customer_user = order_details_current.order.customer.user_id;
    this.orderGateway.server.emit(`${Gateways.Order.UserId}${customer_user}`, {
      action: 'ORDER_BIKER_ARRIVED',
      data: {
        order_id: data.order.id,
        message: data,
      },
    });
    if(order_details_current.order.customer.user.notification_is_active){
      await this.notificationService.create(
        new NotificationEntity({
          user_id: customer_user,
          url: customer_user,
          type: NotificationTypes.ORDERS,
          title_ar: 'الغسلة',
          title_en: 'The wash',
          text_ar: 'تم وصول البايكر للموقع',
          text_en: 'Biker has arrived to the location',
        }),
      );
    }
   
    return data;
  }

  async start(id: string) {
    const order_details = await this.singleOrderDetails(id);

    if (order_details.order.status != OrderStatus.BIKER_ARRIVED)
      throw new BadRequestException('message.order_should_be_arrived_first');
    order_details.order.status = OrderStatus.STARTED;
    await this.order_repo.save(order_details.order);
    order_details.estimated_order_finish_time = new Date(
      new Date().getTime() + (await this.getAppConstants()).wash_time * 60 * 1000,
    );

    await this.order_details_repo.save(order_details);
    const order_details_current = await this.singleOrderDetails(id);
    const order_Dto = new OrderDetailsResponse(order_details_current);
    const data: OrderDetailsResponse = this._i18nResponse.entity(order_Dto);
    const customer_user = order_details_current.order.customer.user_id;
    this.orderGateway.server.emit(`${Gateways.Order.UserId}${customer_user}`, {
      action: 'ORDER_STARTED',
      data: {
        order_id: data.order.id,
        message: data,
      },
    });
    if(order_details_current.order.customer.user.notification_is_active){
      await this.notificationService.create(
        new NotificationEntity({
          user_id: customer_user,
          url: customer_user,
          type: NotificationTypes.ORDERS,
          title_ar: 'الغسلة',
          title_en: 'The wash',
          text_ar: 'طلبك قيد التنفيذ',
          text_en: 'Your order in progress',
        }),
      );
    }
  
    return data;
  }
  async finish(id: string) {
    const order_details = await this.singleOrderDetails(id);

    if (order_details.order.status != OrderStatus.STARTED)
      throw new BadRequestException('message.order_should_be_arrived_started');
    order_details.order.status = OrderStatus.COMPLETED;
    await this.order_repo.save(order_details.order);
    order_details.order_finish_time = new Date();

    await this.order_details_repo.save(order_details);
    const order_details_current = await this.singleOrderDetails(id);
    const order_Dto = new OrderDetailsResponse(order_details_current);
    const data: OrderDetailsResponse = this._i18nResponse.entity(order_Dto);
    const customer_user = order_details_current.order.customer.user_id;

    const app_constants = await this.app_constants
      .createQueryBuilder('app-constants')
      .getOne();

    //********** Add Points For Customer  **********
    // Save New Points In Point Table
    await this.pointRepository.save({
      user_id: order_details.order.customer.user_id,
      points: app_constants.client_wash_point,
    });
    // Sum all the points and put them in User total_points
    const point_user = await this.pointRepository
      .createQueryBuilder('point')
      .where('point.user_id = :user_id', {
        user_id: order_details.order.customer.user_id,
      })
      .select('SUM(point.points)', 'total')
      .getRawOne();
    const point_user_2 = await this.userRepository.findOne({
      where: { id: order_details.order.customer.user_id },
    });
    point_user_2.total_points = point_user.total;
    await this.userRepository.save(point_user_2);
    //********** Add Points For Biker  **********
    // Save New Points In Point Table
    await this.pointRepository.save({
      user_id: order_details.order.biker.user_id,
      points: app_constants.client_wash_point,
    });
    // Sum all the points and put them in User total_points
    const point_biker = await this.pointRepository
      .createQueryBuilder('point')
      .where('point.user_id = :user_id', {
        user_id: order_details.order.biker.user_id,
      })
      .select('SUM(point.points)', 'total')
      .getRawOne();
    const point_biker_2 = await this.userRepository.findOne({
      where: { id: order_details.order.biker.user_id },
    });
    point_biker_2.total_points = point_biker.total;
    await this.userRepository.save(point_biker_2);

    //***************** Update biker *****************
    const biker = await this.getBiker();
    biker.is_active = true;
    await biker.save();

    this.orderGateway.server.emit(`${Gateways.Order.UserId}${customer_user}`, {
      action: 'ORDER_COMPLETED',
      data: {
        order_id: data.order.id,
        message: data,
      },
    });
    if(order_details_current.order.customer.user.notification_is_active){
      await this.notificationService.create(
        new NotificationEntity({
          user_id: customer_user,
          url: customer_user,
          type: NotificationTypes.ORDERS,
          title_ar: 'الغسلة',
          title_en: 'The wash',
         text_ar:'تم إكتمال طلبك !',
          text_en: 'Your order is completed !',
        }),
      );
    }
    
    return data;
  }
  async cancel(createCancelOrderRequest: CreateCancelOrderRequest) {
    const { order_id, another_reason, cancel_reason_id } =
      createCancelOrderRequest;
    const order_current = await this.singleOrder(order_id);

    if (order_current.status != OrderStatus.BIKER_ARRIVED) {
      throw new BadRequestException('message.order_should_be_arrived_only');
    }
    order_current.status = OrderStatus.CANCELLED;
    await this.order_repo.save(order_current);

    const biker = await this.getBiker();
    biker.is_active = true;
    await biker.save();

    //* Add Cancel Order
    let cancelReason: CancelReasons = null;
    if (cancel_reason_id) {
      cancelReason = await this.cancel_reasons_repo.findOne({
        where: { id: cancel_reason_id },
      });

      if (!cancelReason) {
        throw new NotFoundException('message.cancel_reason_not_found');
      }
    }

    const reportAbuser = this.report_abuse_repo.create({
      another_reason: another_reason,
      user_id: this._request.user.id,
      order_id: order_id,
      cancel_reason: cancelReason,
    });
    await this.report_abuse_repo.save(reportAbuser);

    //*when biker cancel order, we should return wash count and service count to customer
    const subscription = await this.subscription_repo.findOne({
      where: { id: order_current.subscription_id },
      relations: { service: true },
    });

    if (order_current.services.length != 0) {
      console.log('enter if services ');
      const order_service_ids = order_current.services.map((e) => e.service_id);
      const service = await this.service_repo.find({
        where: {
          service_id: In(order_service_ids),
          subscription_id: subscription.id,
        },
      });
      service.map((e) => {
        e.service_count++;
      });
      await this.service_repo.save(service);
      subscription.wash_count++;
      subscription.status = SubscriptionStatus.ACTIVE;
      await subscription.save();
    }
    const order_details_current = await this.singleOrderDetails(order_id);
    const order_Dto = new OrderDetailsResponse(order_details_current);
    const data: OrderDetailsResponse = this._i18nResponse.entity(order_Dto);
    const customer_user = order_details_current.order.customer.user_id;
    this.orderGateway.server.emit(`${Gateways.Order.UserId}${customer_user}`, {
      action: 'ORDER_COMPLETED',
      data: {
        order_id: data.order.id,
        message: data,
      },
    });
    if(order_details_current.order.customer.user.notification_is_active){
      await this.notificationService.create(
        new NotificationEntity({
          user_id: customer_user,
          url: customer_user,
          type: NotificationTypes.ORDERS,
          title_ar: 'الغسلة',
          title_en: 'The wash',
          text_ar: 'لقد تم الغاء حجزك',
          text_en: 'Your car wash has been canceled',
        }),
      );
    }
 
   
    return data;
  }

  async getAllCancelReasons() {
    const cancel_reasons = await this.cancel_reasons_repo.find();
    return cancel_reasons;
  }
  async uploadOrderImage(orderFinishRequest: OrderFinishRequest) {
    const { id_order, file: order_image, status } = orderFinishRequest;
    const order_details = await this.singleOrderDetails(id_order);
    if (order_details.order.status != OrderStatus.STARTED)
      throw new BadRequestException('message.order_should_be_arrived_started');
    const order_image_dto = new UploadFileRequest();
    order_image_dto.file = order_image;

    const order_image_uploaded = await this._fileService.upload(
      order_image_dto,
      'order-images',
    );
    //* Delete Old Image If Exited
    const order_image_fetch = await this.order_image_repo.findOneBy({
      order_details_id: order_details.id,
      type: status,
    });
    if (order_image_fetch) {
      await this.order_image_repo.delete(order_image_fetch.id);
    }
    //* Create Order image Entity
    const order_image_created = this.order_image_repo.create({
      order_details_id: order_details.id,
      image_url: order_image_uploaded,
      type: status,
    });
    await this.order_image_repo.save(order_image_created);
    const order_details_current = await this.singleOrderDetails(id_order);
    const order_Dto = new OrderDetailsResponse(order_details_current);
    const data: OrderDetailsResponse = this._i18nResponse.entity(order_Dto);
    this.orderGateway.server.emit(`${Gateways.Order.UserId}${id_order}`, {
      action: 'ORDER_UPLOAD_IMAGE',
      data: {
        order_id: data.order.id,
        message: data,
      },
    });
    return data;
  }

  async singleOrderDetails(id: string) {
    const order_details = await this.order_details_repo.findOne({
      where: { order_id: id },
      relations: {
        order: {
          services: true,
          subscription: true,
          slot: true,
          vehicle: {
            color: true,
            images: true,
            brand_model: true,
            brand: true,
          },
          order_invoice: {
            subscription: {
              service: true,
            },
          },
          address: true,
          customer: { user: true },
          biker: { user: true },
        },
        order_images: true,
      },
    });

    if (!order_details) {
      throw new NotFoundException('message.order_details_not_found');
    }
    return order_details;
  }
  async compeleteService(id: string) {
    const service = await this.order_service_repo.findOne({ where: { id } });
    const order = await this.order_repo.findOne({
      where: { id: service.order_id },
    });

    if (order.status != OrderStatus.STARTED)
      throw new BadRequestException('order_should_be_arrived_started');
    service.finish_time = new Date();
    return await this.order_service_repo.save(service);
  }

  async rescheduleOrder(id: string) {
    const order = await this.orderRescheduleTransaction.run(id);
    await this.cronOrder.handleCron();
    return order;
  }
}
