import { ApiProperty, PartialType } from "@nestjs/swagger";
import { Expose, plainToInstance, Transform, Type } from "class-transformer";
import { RegisterResponse } from "./register.response";
import { AddressResponse } from "src/modules/address/dto/responses/address.respone";
import { SamModuleResponse } from "src/modules/employee/dto/response/sam-modules.response";
import { RestaurantResponse } from "src/modules/restaurant/dto/responses/restaurant.response";
import { DriverResponse } from "src/modules/driver/response/driver.response";

export class AuthResponse extends PartialType(RegisterResponse) {
    @ApiProperty()
    @Expose() access_token: string;

    @Expose() address?: AddressResponse;
    @Expose() @Type(()=> SamModuleResponse) samModules?: SamModuleResponse[];
    @Expose() @Transform(value=>plainToInstance(RestaurantResponse,value.obj.restaurant)) restaurant?: RestaurantResponse;
    @Expose() @Transform(value=>plainToInstance(DriverResponse,value.obj.driver)) driver?: DriverResponse;
}
