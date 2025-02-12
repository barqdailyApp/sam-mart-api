import { Expose, plainToClass, Transform, Type } from "class-transformer";
import { PaymentMethod } from "src/infrastructure/entities/payment_method/payment_method.entity";
import { AddressResponse } from "src/modules/address/dto/responses/address.respone";
import { DriverResponse } from "src/modules/driver/response/driver.response";
import { SamModuleResponse } from "src/modules/employee/dto/response/sam-modules.response";
import { RestaurantResponse } from "src/modules/restaurant/dto/responses/restaurant.response";
import { UserResponse } from "src/modules/user/dto/responses/user.response";

export class RestaurantOrderListResponse {
 
 @Expose()
    id: string;
    @Expose()
    number: string;

    @Expose()
   @Transform(({ value }) => { return { id: value?.id, type: value?.type } })
    payment_method?: PaymentMethod;
  
    @Expose()
    status: string;
    @Expose()
    created_at: Date;
    @Expose()
    @Type(() => AddressResponse) address?: AddressResponse
  
    @Expose()
    estimated_delivery_time: number;
    @Expose()
    total_price: number;
    @Expose()
    @Type(() => UserResponse) user?: UserResponse;
    @Expose()
    @Type(() => RestaurantResponse) restaurant?: RestaurantResponse;
    @Expose()
    @Type(() => DriverResponse) driver?: DriverResponse
}