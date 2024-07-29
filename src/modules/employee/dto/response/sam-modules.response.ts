import { Expose, Transform, Type, plainToClass } from "class-transformer";
import { UserResponse } from "src/modules/user/dto/responses/user.response";

export class SamModuleResponse{
    @Expose() id: string;
    @Expose() name_ar: string;
    @Expose() name_en: string;
}