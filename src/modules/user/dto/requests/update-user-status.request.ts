import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Language } from 'src/infrastructure/data/enums/language.enum';
import { UserStatus } from 'src/infrastructure/data/enums/user-status.enum';

export class UserStatusRequest {
  @ApiProperty({
    enum: [UserStatus.ActiveClient, UserStatus.BlockedClient],
  })
  @IsNotEmpty()
  @IsEnum(UserStatus)
  status: UserStatus;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  user_id: string;
}
