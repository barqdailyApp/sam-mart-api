import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateQuestionRequest {
  @ApiProperty({required:false,nullable:true})
  @IsString()
  @IsOptional()
  question_ar: string;

  @ApiProperty({required:false,nullable:true})
  @IsString()
  @IsOptional()
  answer_ar: string;

  @ApiProperty({required:false,nullable:true})
  @IsString()
  @IsOptional()
  question_en: string;

  @ApiProperty({required:false,nullable:true})
  @IsString()
  @IsOptional()
  answer_en: string;
}
