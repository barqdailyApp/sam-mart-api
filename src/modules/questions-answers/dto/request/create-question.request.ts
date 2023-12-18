import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateQuestionRequest {


  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  question_ar: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  answer_ar: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  question_en: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  answer_en: string;
}
