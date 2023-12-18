import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateBannerRequest {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({
    default: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
  })
  end_time: Date;

  @ApiProperty({ type: 'file', required: true })
  file: Express.Multer.File;
}
