import { Expose, Transform, Type, plainToClass } from "class-transformer";
import { UserResponse } from "src/modules/user/dto/responses/user.response";

export class EmployeeResponse{
    @Expose() id: string;
    @Expose() name_ar: string;
    @Expose() name_en: string;
    @Expose() qualification: string;
    @Expose() is_active: boolean;
    @Expose() departements: string[];
    @Expose() user_id: string;
    @Expose() country_id: string;
    @Expose() city_id: string;
    @Expose() created_at: Date;
    @Expose() updated_at: Date;

    @Expose() @Type(() => UserResponse) user: UserResponse;
}