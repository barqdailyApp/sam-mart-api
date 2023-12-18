import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseUserService } from 'src/core/base/service/user-service.base';
import { QuestionAndAnswer } from 'src/infrastructure/entities/question-answer/question-answer.entity';
import { DeleteResult, Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { CreateQuestionRequest } from './dto/request/create-question.request';
import { PaginatedRequest } from 'src/core/base/requests/paginated.request';
import { applyQueryIncludes } from 'src/core/helpers/service-related.helper';
import { UpdateQuestionRequest } from './dto/request/update-question.request';
@Injectable()
export class QuestionsAnswersService {
  constructor(
    @InjectRepository(QuestionAndAnswer)
    private _repo: Repository<QuestionAndAnswer>,
  ) {}

  async createNewQuestionsAnswers(
    createQuestionRequest: CreateQuestionRequest,
  ) {
    const { answer_ar, question_ar, answer_en, question_en } =
      createQuestionRequest;

    const questionsAnswers = this._repo.create({
      answer_ar,
      question_ar,
      answer_en,
      question_en,
    });
    let result: QuestionAndAnswer;
    try {
      result = await this._repo.save(questionsAnswers);
    } catch (e) {
      throw new BadRequestException(e.message);
    }

    return result;
  }


  async getAllQuestionAndAnswer(){
    return await this._repo.find();
  }

  async deleteQuestionAndAnswer(id: string) {
    const questionAndAnswer = await this._repo.findOne({ where: { id: id } });
    if (!questionAndAnswer) {
      throw new NotFoundException('message.question_and_answer_not_found');
    }
    return await this._repo.delete(id);
  }

  async updateQuestionAndAnswer(
    id: string,
    updateQuestionRequest: UpdateQuestionRequest,
  ) {
    await this._repo.update(id, updateQuestionRequest);
    return await this._repo.findOne({ where: { id: id } });
  }
}
