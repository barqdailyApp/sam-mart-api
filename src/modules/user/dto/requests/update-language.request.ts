import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Language } from 'src/infrastructure/data/enums/language.enum';

export class UpdateLanguageRequest {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  user_id: string;
  
  @ApiProperty({ enum: Language, enumName: 'Language' })
  @IsEnum(Language)
  @IsNotEmpty()
  language: Language;
}
