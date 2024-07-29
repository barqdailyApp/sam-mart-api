import { ApiProperty, PartialType } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { RegisterResponse } from "./register.response";
import { AddressResponse } from "src/modules/address/dto/responses/address.respone";
import { SamModuleResponse } from "src/modules/employee/dto/response/sam-modules.response";

export class AuthResponse extends PartialType(RegisterResponse) {
    @ApiProperty()
    @Expose() access_token: string;

    @Expose() address?: AddressResponse;
    @Expose() @Type(()=> SamModuleResponse) samModules?: SamModuleResponse[];
}
