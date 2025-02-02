import { Expose, Transform, Type } from "class-transformer";
import { PaymentMethod } from "src/infrastructure/entities/payment_method/payment_method.entity";
import { AddressResponse } from "src/modules/address/dto/responses/address.respone";
import { SamModuleResponse } from "src/modules/employee/dto/response/sam-modules.response";
import { UserResponse } from "src/modules/user/dto/responses/user.response";

export class RestaurantOrderListResponse {
 
 @Expose()
    id: string;
    @Expose()
    number: string;
   @Type(()=> PaymentMethod) payment_method?: PaymentMethod;  
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
}