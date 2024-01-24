import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { DriverStatus } from "src/infrastructure/data/enums/driver-status.enum";

export class UpdateDriverStatusRequest {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    driver_id: string;

    @ApiProperty({
        nullable: true,
        required: false,
        enum: [
            DriverStatus.VERIFIED,
            DriverStatus.PENDING,
            DriverStatus.INACTIVE,
            DriverStatus.SUSPENDED,
            DriverStatus.BLOCKED,
        ],
    })
    @IsNotEmpty()
    @IsEnum(DriverStatus)
    status: DriverStatus;

    @ApiProperty()
    @IsOptional()
    @IsString()
    status_reason: string;

}