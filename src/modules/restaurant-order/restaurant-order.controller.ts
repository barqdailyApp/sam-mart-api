import { Body, ClassSerializerInterceptor, Controller, Get, Inject, Param, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { RestaurantOrderService } from './restaurant-order.service';
import { MakeRestaurantOrderRequest } from './dto/request/make-restaurant-order.request';
import { ApiBearerAuth, ApiConsumes, ApiHeader, ApiTags } from '@nestjs/swagger';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { Roles } from '../authentication/guards/roles.decorator';
import { RolesGuard } from '../authentication/guards/roles.guard';
import { plainToInstance } from 'class-transformer';
import { ActionResponse } from 'src/core/base/responses/action.response';
import { RestaurantOrderListResponse } from './dto/response/restaurant-order-list.response';
import { I18nResponse } from 'src/core/helpers/i18n.helper';
import { PaginatedRequest } from 'src/core/base/requests/paginated.request';
import { PaginatedResponse } from 'src/core/base/responses/paginated.response';
import { GetDriverRestaurantOrdersQuery } from './dto/query/get-driver-restaurant-order.query';
import { RestaurantOrderDetailsResponse } from './dto/response/restaurant-order-details.response';
import { CancelShipmentRequest } from '../order/dto/request/cancel-shipment.request';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadValidator } from 'src/core/validators/upload.validator';
import { AddShipmentChatMessageRequest } from '../order/dto/request/add-shipment-chat-message.request';
import { ShipmentMessageResponse } from '../order/dto/response/shipment-message.response';
import { GetCommentQueryRequest } from '../support-ticket/dto/request/get-comment-query.request';
import { AddReviewReplyRequest, AddReviewRequest } from './dto/request/add-review-request';
import { RestaurantOrderReviewResponse } from './dto/response/restaurant-order-review.response';
@ApiBearerAuth()
@ApiHeader({
  name: 'Accept-Language',
  required: false,
  description: 'Language header: en, ar',
})
@ApiTags('Restaurant-Order')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('restaurant-order')
export class RestaurantOrderController {
    constructor(private readonly restaurantOrderService: RestaurantOrderService
      ,@Inject(I18nResponse) private readonly _i18nResponse: I18nResponse
    ){}
  
    @Roles(Role.CLIENT)
    @Post('checkout')
    async makeRestaurantOrder(@Body() req: MakeRestaurantOrderRequest){
        return await this.restaurantOrderService.makeRestaurantOrder(req);   
    }

    @Roles(Role.DRIVER)
    @Get('driver-requests')
    async getRestaurantOrdersDriverRequests(@Query() query:PaginatedRequest){
      // add pagination
      const {orders,total}=await this.restaurantOrderService.getRestaurantOrdersDriverRequests(query);


      const response = this._i18nResponse.entity(orders);
      const result=plainToInstance(RestaurantOrderListResponse,response,{
        excludeExtraneousValues: true,
      })
      return new PaginatedResponse(result,{
        meta:{
          total,
          ...query
        }
      });
    }

    @Roles(Role.DRIVER)
    @Get('driver-orders')
    async getRestaurantOrdersDriverOrders(@Query() query:GetDriverRestaurantOrdersQuery){
      // add pagination
      const {orders,total}=await this.restaurantOrderService.getRestaurantOrdersDriverOrders(query);


      const response = this._i18nResponse.entity(orders);
      const result=plainToInstance(RestaurantOrderListResponse,response,{
        excludeExtraneousValues: true,
      })
      return new PaginatedResponse(result,{
        meta:{
          total,
          ...query
        }
      });
    }

    
    @Roles(Role.CLIENT)
    @Get('client-orders')
    async getRestaurantOrdersClientOrders(@Query() query:GetDriverRestaurantOrdersQuery){
      // add pagination
      const {orders,total}=await this.restaurantOrderService.getRestaurantOrdersClientOrders(query);


      const response = this._i18nResponse.entity(orders);
      const result=plainToInstance(RestaurantOrderListResponse,response,{
        excludeExtraneousValues: true,
      })
      return new PaginatedResponse(result,{
        meta:{
          total,
          ...query
        }
      });
    }

    @Roles(Role.DRIVER)
    @Post('driver-accept-order/:id')
    async driverAcceptOrder(@Param('id') id:string){
      return new ActionResponse(await this.restaurantOrderService.driverAcceptOrder(id));
    }

    @Roles(Role.DRIVER)
    @Get('total-driver-orders')
    async getTotalDriverOrders() {
      const total = await this.restaurantOrderService.getTotalDriverOrders();
      return new ActionResponse(total);
    }
    
    @Get('/details/:id')
    async getRestaurantOrderDetails(@Param('id') id:string){
      const order=await this.restaurantOrderService.getRestaurantOrderDetails(id);
      const response = this._i18nResponse.entity(order);
      console.log(order.restaurant_order_meals[0]?.restaurant_order_meal_options);
      const result=plainToInstance(RestaurantOrderDetailsResponse,response,{
        excludeExtraneousValues: true,
      })
      return new ActionResponse(result);
    }

    @Post('driver-pickup/:id')
    async readyForPickup(@Param('id') id:string){
      return new ActionResponse(await this.restaurantOrderService.pickupOrder(id));
    }

    @Post('driver-deliver/:id')
    async deliverOrder(@Param('id') id:string){
      return new ActionResponse(await this.restaurantOrderService.deliverOrder(id));
    }

    @Post('/cancel/:id')
    async cancelOrder(@Param('id') id:string, @Body() req: CancelShipmentRequest,){
      return new ActionResponse(await this.restaurantOrderService.cancelOrder(id,req));
    }


      @Post('add-chat-message/:order_id')
      @UseInterceptors(ClassSerializerInterceptor, FileInterceptor('file'))
      @ApiConsumes('multipart/form-data')
      async addChatMessage(
        @Param('order_id') order_id: string,
        @Body() req: AddShipmentChatMessageRequest,
        @UploadedFile(new UploadValidator().build()) file: Express.Multer.File,
      ): Promise<ActionResponse<ShipmentMessageResponse>> {
        req.file = file;
    
        const createdMesssage = await this.restaurantOrderService.addChatMessage(
          order_id,
          req,
        );
        const result = plainToInstance(ShipmentMessageResponse, createdMesssage, {
          excludeExtraneousValues: true,
        });
        return new ActionResponse<ShipmentMessageResponse>(result);
      }
    
      @Get('get-messages/:order_id')
      async getMessagesByShipmentId(
        @Param('order_id') order_id: string,
        @Query() query: GetCommentQueryRequest,
      ): Promise<ActionResponse<ShipmentMessageResponse[]>> {
        const messages = await this.restaurantOrderService.getMessagesByShipmentId(
          order_id,
          query,
        );
        const result = plainToInstance(ShipmentMessageResponse, messages, {
          excludeExtraneousValues: true,
        });
        return new ActionResponse<ShipmentMessageResponse[]>(result);
      }
      @Roles(Role.CLIENT)
      @Post('add-review/:order_id')
      async addReview(@Param('order_id') order_id: string, @Body() req: AddReviewRequest){
        return new ActionResponse(await this.restaurantOrderService.addReview(order_id,req));
      }
      @Roles(Role.CLIENT,Role.RESTAURANT_ADMIN)
      @Post('review-reply/:id')
      async addReviewReply(@Param('id') id:string,@Body() req: AddReviewReplyRequest){
        return new ActionResponse(await this.restaurantOrderService.AddReviewReply(id,req));
      }

      @Get('get-reviews/:restaurant_id')
      async getReviews(@Param('restaurant_id') restaurant_id:string,@Query() query:PaginatedRequest){
        const {reviews,total}=await this.restaurantOrderService.getReviews(restaurant_id,query);
        const response= plainToInstance(RestaurantOrderReviewResponse,reviews,{excludeExtraneousValues:true});
        return new PaginatedResponse(response,{meta:{total,...query}});
      }

}
