import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class UpdateFcmTokenRequest {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    fcmToken: string;
}