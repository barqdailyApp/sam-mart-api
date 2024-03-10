import { ApiProperty, PartialType } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { RegisterResponse } from "./register.response";
import { AddressResponse } from "src/modules/address/dto/responses/address.respone";

export class AuthResponse extends PartialType(RegisterResponse) {
    @ApiProperty()
    @Expose() access_token: string;

    @Expose() address?: AddressResponse;
}
