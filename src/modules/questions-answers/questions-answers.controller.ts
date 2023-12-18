import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { QuestionsAnswersService } from './questions-answers.service';
import { CreateQuestionRequest } from './dto/request/create-question.request';
import { PaginatedRequest } from 'src/core/base/requests/paginated.request';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { RolesGuard } from '../authentication/guards/roles.guard';
import { QuestionAndAnswer } from 'src/infrastructure/entities/question-answer/question-answer.entity';
import { plainToClass, plainToInstance } from 'class-transformer';
import { GetQuestionResponse } from './dto/response/get-questions.respons';
import { PaginatedResponse } from 'src/core/base/responses/paginated.response';
import { ActionResponse } from 'src/core/base/responses/action.response';
import { DeleteResult } from 'typeorm';
import { UpdateQuestionRequest } from './dto/request/update-question.request';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { Roles } from '../authentication/guards/roles.decorator';
import { I18nResponse } from 'src/core/helpers/i18n.helper';
@ApiBearerAuth()
@ApiHeader({
  name: 'Accept-Language',
  required: false,
  description: 'Language header: en, ar',
})
@ApiTags('questions-answers')
@Controller('questions-answers')
export class QuestionsAnswersController {
  constructor(
    private readonly questionsAnswersService: QuestionsAnswersService,
    @Inject(I18nResponse) private readonly _i18nResponse: I18nResponse,
  ) {}
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('create-question')
  async createNewQuestion(
    @Body() createQuestionRequest: CreateQuestionRequest,
  ) {
    const questionAndAnswer: QuestionAndAnswer =
      await this.questionsAnswersService.createNewQuestionsAnswers(
        createQuestionRequest,
      );

    const result: GetQuestionResponse = plainToInstance(
      GetQuestionResponse,
      questionAndAnswer,
    );
    const data: GetQuestionResponse = this._i18nResponse.entity(result);
    return new ActionResponse<GetQuestionResponse>(data);
  }
  @Get('all-questions')
  async getAllQuestions() {
    const questionAndAnswerList: QuestionAndAnswer[] =
      await this.questionsAnswersService.getAllQuestionAndAnswer();
    const result: GetQuestionResponse[] = plainToInstance(
      GetQuestionResponse,
      questionAndAnswerList,
    );
    const data: GetQuestionResponse[] = this._i18nResponse.entity(result);
    return new ActionResponse<GetQuestionResponse[]>(data);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id/delete-question')
  async deleteQuestion(@Param('id') id: string) {
    const result = await this.questionsAnswersService.deleteQuestionAndAnswer(
      id,
    );
    return new ActionResponse<DeleteResult>(result);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id/update-question')
  async updateTask(
    @Param('id') id: string,
    @Body() updateQuestionRequest: UpdateQuestionRequest,
  ) {
    const result = await this.questionsAnswersService.updateQuestionAndAnswer(
      id,
      updateQuestionRequest,
    );
    return new ActionResponse<QuestionAndAnswer>(result);
  }
}
