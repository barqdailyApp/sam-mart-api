import { Injectable } from '@nestjs/common';
import { Seeder, DataFactory } from 'nestjs-seeder';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';


import * as fs from 'fs';
import { QuestionAndAnswer } from 'src/infrastructure/entities/question-answer/question-answer.entity';

@Injectable()
export class FaqsSeeder implements Seeder {
  constructor(
    @InjectRepository(QuestionAndAnswer)
    private readonly QuestionAndAnswersRepository: Repository<QuestionAndAnswer>,
  ) {}

  async seed(): Promise<any> {
    //* load data from json faqs file
    const dataItems = fs.readFileSync('./json/faq.json', 'utf8');
    const questionAndAnswerData = JSON.parse(dataItems);
    const items = questionAndAnswerData.map((questionAndAnswer: QuestionAndAnswer, i: number) => {
      
      return this.QuestionAndAnswersRepository.create(questionAndAnswer);
    });
    //* save items entities in database
    return await this.QuestionAndAnswersRepository.save(items);
  }

  async drop(): Promise<any> {
    return this.QuestionAndAnswersRepository.delete({});
  }
}
