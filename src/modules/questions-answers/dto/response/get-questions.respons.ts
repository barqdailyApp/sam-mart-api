import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class GetQuestionResponse {
  @Expose() id: string;
  @Expose() question_ar: string;
  @Expose() answer_ar: string;
  @Expose() question_en: string;
  @Expose() answer_en: string;
}
