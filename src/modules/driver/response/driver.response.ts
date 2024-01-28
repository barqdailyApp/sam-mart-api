import { Exclude, Expose, Transform, plainToClass } from "class-transformer";
import { UserResponse } from "../../user/dto/responses/user.response";

@Exclude()

export class DriverResponse {
    @Expose() id: string;

    @Expose() latitude : string;

    @Expose() longitude : string;

    @Expose() address : string;

    @Transform(({ value }) => plainToClass(UserResponse, value))
    @Expose()
    readonly user: UserResponse;

}
