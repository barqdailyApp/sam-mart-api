import { Expose, Type } from "class-transformer";
import { User } from "src/infrastructure/entities/user/user.entity";
import { UserResponse } from "src/modules/user/dto/responses/user.response";


export class ReviewReplyResponse {
    @Expose() id: string;

    @Expose() comment: string;
    @Expose() created_at: Date;
    @Expose()
    @Type(()=>UserResponse)
    user: User
}
export class RestaurantOrderReviewResponse {
    @Expose() id: string;

    @Expose() comment: string;

    @Expose() rating: number;
    @Expose() created_at: Date;


    @Expose() 
    @Type(()=>UserResponse)
    user: User;

    @Expose()
    @Type(() => ReviewReplyResponse)
    replies: ReviewReplyResponse[]

}

