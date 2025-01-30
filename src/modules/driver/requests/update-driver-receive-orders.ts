import { DriverType } from '@codebrew/nestjs-storage';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { DriverTypeEnum } from 'src/infrastructure/data/enums/driver-type.eum';

export class UpdateDriverReceiveOrdersRequest {

    @ApiProperty({ default: true })
    @IsNotEmpty()
    @Transform(({ value }) => {
      return value === 'true' || value === true;
    })
    @IsBoolean()
    is_receive_orders: boolean;

@ApiProperty({default:DriverTypeEnum.MART,enum:DriverTypeEnum})
@IsNotEmpty()
@IsString()
@IsEnum(DriverTypeEnum)
type:DriverTypeEnum

}
