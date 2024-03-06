import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { DriverStatus } from 'src/infrastructure/data/enums/driver-status.enum';
import { Language } from 'src/infrastructure/data/enums/language.enum';
import { UserStatus } from 'src/infrastructure/data/enums/user-status.enum';

export class DriverStatusRequest {
  @ApiProperty({
    enum: [DriverStatus.BLOCKED, DriverStatus.VERIFIED],
  })
  @IsNotEmpty()
  @IsEnum(DriverStatus)
  status: DriverStatus;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  driver_id: string;
}
