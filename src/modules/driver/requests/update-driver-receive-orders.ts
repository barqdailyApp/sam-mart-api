import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class UpdateDriverReceiveOrdersRequest {

    @ApiProperty({ default: true })
    @IsNotEmpty()
    @Transform(({ value }) => {
      return value === 'true' || value === true;
    })
    @IsBoolean()
    is_receive_orders: boolean;
}
