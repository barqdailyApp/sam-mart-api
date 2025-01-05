import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CreateBanarRequest } from 'src/modules/banar/dto/request/create-banar.request';

export class CreateFoodBanarRequest extends CreateBanarRequest {

    @ApiProperty({  required:false})
    @IsOptional()
    @IsString()
    restaurant_id: string


}
