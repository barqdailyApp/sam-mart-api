import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBanarRequest {
    @ApiProperty({ type: 'file', required: true })
    banar: Express.Multer.File;

    @ApiProperty()
    @IsDateString()
    @IsNotEmpty()
    started_at: Date;

    @ApiProperty()
    @IsDateString()
    @IsNotEmpty()
    ended_at: Date;

    @ApiProperty({ nullable: true, required: false, default: true })
    @IsOptional()
    @Transform((value) => Boolean(value))
    @IsBoolean()
    is_active: boolean;
}
