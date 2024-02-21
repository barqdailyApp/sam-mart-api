import { Injectable } from '@nestjs/common';
import { Seeder } from 'nestjs-seeder';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import { SupportTicketSubject } from 'src/infrastructure/entities/support-ticket/suppot-ticket-subject.entity';

@Injectable()
export class SupportTicketSubjectSeeder implements Seeder {
    constructor(
        @InjectRepository(SupportTicketSubject)
        private readonly subjectRepository: Repository<SupportTicketSubject>,
    ) { }

    async seed(): Promise<any> {
        const data = fs.readFileSync('./json/support-ticket-subjects.json', 'utf8');
        const subjectsData: { title: string }[] = JSON.parse(data);

        for (const subjectData of subjectsData) {
            const subject = this.subjectRepository.create(subjectData);

            await this.subjectRepository.save(subject);
        }
    }

    async drop(): Promise<any> {
        return await this.subjectRepository.delete({});
    }
}
